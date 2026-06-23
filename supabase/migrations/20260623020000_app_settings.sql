create table if not exists "public"."app_settings" (
  "key" text primary key,
  "value" text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

-- Insert default shipping charge of 150
insert into "public"."app_settings" ("key", "value")
values ('flat_shipping_charge', '150')
on conflict ("key") do nothing;

-- Enable RLS
alter table "public"."app_settings" enable row level security;

-- Everyone can read settings
create policy "Enable read access for all users on app_settings"
on "public"."app_settings"
as permissive
for select
to public
using (true);

-- Only admins can modify
create policy "Enable insert for admin users only on app_settings"
on "public"."app_settings"
for insert
to authenticated
with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Enable update for admin users only on app_settings"
on "public"."app_settings"
for update
to authenticated
using ((auth.jwt() ->> 'is_admin')::boolean = true);
