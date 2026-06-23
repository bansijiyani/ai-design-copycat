create table if not exists "public"."otp_codes" (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    otp text not null,
    type text not null, -- 'signup' or 'admin_login'
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone not null
);

-- RLS
alter table "public"."otp_codes" enable row level security;
create policy "Service role can manage otp codes" on "public"."otp_codes" using (true) with check (true);
