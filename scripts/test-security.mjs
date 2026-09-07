import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const admin = '00000000-0000-4000-8000-000000000001';
const outsider = '00000000-0000-4000-8000-000000000002';
try {
  // Auth identities are test fixtures. Policies and triggers use the actual migration.
  await db.exec(
    `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; insert into auth.users values ('${admin}'),('${outsider}');`,
  );
  await db.exec(
    await readFile(
      'supabase/migrations/202609060001_author_garden.sql',
      'utf8',
    ),
  );
  await db.query('insert into admin_users(user_id) values ($1)', [admin]);
  const role = async (name, id = '') => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec(`set role ${name}`);
  };
  await role('authenticated', admin);
  await db.exec(
    "insert into poems(id,title,content,slug,status,publish_at) values ('live','Luz','  verso\n\n    outro  ','luz','published',now()-interval '1 minute'),('draft','Segredo','privado','segredo','draft',null),('future','Amanhã','privado','amanha','published',now()+interval '1 day');",
  );
  assert.equal((await db.query('select * from poems')).rows.length, 3);
  await role('anon');
  assert.deepEqual(
    (await db.query('select id from poems')).rows.map((row) => row.id),
    ['live'],
  );
  await assert.rejects(db.exec("insert into poems(title) values ('invasão')"));
  await assert.rejects(db.exec("update poems set title='invasão'"));
  await assert.rejects(db.exec('delete from poems'));
  await assert.rejects(db.exec('select * from admin_users'));
  await role('authenticated', outsider);
  assert.deepEqual(
    (await db.query('select id from poems')).rows.map((row) => row.id),
    ['live'],
  );
  assert.equal((await db.query('select * from admin_users')).rows.length, 0);
  await assert.rejects(
    db.query('insert into admin_users(user_id) values ($1)', [outsider]),
  );
  await assert.rejects(db.exec("insert into poems(title) values ('invasão')"));
  assert.equal(
    (await db.query("update poems set title='invasão' returning id")).rows
      .length,
    0,
  );
  assert.equal(
    (await db.query('delete from poems returning id')).rows.length,
    0,
  );
  await role('authenticated', admin);
  assert.equal((await db.query('select * from admin_users')).rows.length, 1);
  await assert.rejects(
    db.query('insert into admin_users(user_id) values ($1)', [outsider]),
  );
  await assert.rejects(
    db.exec("update poems set id='changed' where id='live'"),
  );
  await assert.rejects(
    db.exec("update poems set created_at=now() where id='live'"),
  );
  for (const sql of [
    "insert into poems(title,slug) values ('Duplicado','luz')",
    "update poems set place='invalid' where id='draft'",
    "update poems set tags=array['bad tag'] where id='draft'",
    "update poems set tags=array['amor','amor'] where id='draft'",
    "update poems set status='published' where id='draft'",
    "update poems set series='Em português se diz' where id='draft'",
  ])
    await assert.rejects(db.exec(sql));
  const before = (
    await db.query("select updated_at,content from poems where id='live'")
  ).rows[0];
  await db.exec("update poems set title='Outra luz' where id='live'");
  const after = (
    await db.query("select updated_at,content from poems where id='live'")
  ).rows[0];
  assert.notEqual(before.updated_at, after.updated_at);
  assert.equal(before.content, after.content);
  await db.exec(
    "update poems set publish_at=now()-interval '1 second' where id='future'",
  );
  await role('anon');
  assert.equal((await db.query('select * from poems')).rows.length, 2);
  await role('authenticated', admin);
  await db.exec(
    "update poems set status='draft',publish_at=null where id='live'",
  );
  await role('anon');
  assert.deepEqual(
    (await db.query('select id from poems')).rows.map((row) => row.id),
    ['future'],
  );
  await role('authenticated', admin);
  await db.exec("delete from poems where id='draft'");
  await db.exec('reset role');
  await db.exec('delete from admin_users');
  await role('authenticated', admin);
  assert.equal(
    (await db.query("select * from poems where id='live'")).rows.length,
    0,
  );
  await assert.rejects(
    db.exec("insert into poems(title) values ('sem acesso')"),
  );
  console.log(
    'PostgreSQL/PGlite: RLS anon, não-admin, admin, revogação, CRUD, agendamento, identidade, constraints e timestamps verificados. Auth remoto não simulado como integração real.',
  );
} finally {
  await db.close();
}
