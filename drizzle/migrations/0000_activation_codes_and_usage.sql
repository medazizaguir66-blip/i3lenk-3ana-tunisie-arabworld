CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  device_id TEXT,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.activation_codes TO service_role;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
CREATE INDEX activation_codes_device_idx ON public.activation_codes (device_id);

CREATE TABLE public.daily_usage (
  device_id TEXT NOT NULL,
  day DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (device_id, day)
);
GRANT ALL ON public.daily_usage TO service_role;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Atomically consume one free try; returns the new count, or -1 when the limit is already reached.
CREATE OR REPLACE FUNCTION public.consume_free_try(_device_id TEXT, _limit INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _day DATE := (now() AT TIME ZONE 'Africa/Tunis')::date;
  _new INTEGER;
BEGIN
  INSERT INTO public.daily_usage (device_id, day, count)
  VALUES (_device_id, _day, 1)
  ON CONFLICT (device_id, day) DO UPDATE
    SET count = public.daily_usage.count + 1
    WHERE public.daily_usage.count < _limit
  RETURNING count INTO _new;
  IF _new IS NULL THEN
    RETURN -1;
  END IF;
  RETURN _new;
END;
$$;

-- Give back a try when generation fails after it was consumed.
CREATE OR REPLACE FUNCTION public.refund_free_try(_device_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.daily_usage SET count = GREATEST(count - 1, 0)
  WHERE device_id = _device_id AND day = (now() AT TIME ZONE 'Africa/Tunis')::date;
$$;

REVOKE ALL ON FUNCTION public.consume_free_try(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_free_try(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_free_try(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_free_try(TEXT) TO service_role;