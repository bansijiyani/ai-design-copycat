alter table "public"."orders" add column "updated_at" timestamp with time zone default now();

-- Update the updated_at column automatically on any row change
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on "public"."orders"
  for each row execute procedure moddatetime (updated_at);
