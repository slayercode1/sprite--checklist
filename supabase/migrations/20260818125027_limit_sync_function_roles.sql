revoke all on function public.sync_sprite_collection(uuid, text, jsonb, timestamptz) from authenticated;
revoke all on function public.sync_sprite_collection(uuid, text, jsonb, timestamptz) from service_role;
revoke all on function public.sync_health() from authenticated;
revoke all on function public.sync_health() from service_role;
