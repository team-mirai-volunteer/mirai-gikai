-- Enable PostgREST aggregate functions (count/sum/min/max/avg)
ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';

-- If you also query using JWT role = authenticated/anon, enable those too
-- ALTER ROLE authenticated SET pgrst.db_aggregates_enabled = 'true';
-- ALTER ROLE anon          SET pgrst.db_aggregates_enabled = 'true';

ALTER USER authenticator SET plan_filter.statement_cost_limit = 1e7;

-- anonymous users can only run cheap queries
ALTER
  USER anon
SET
  plan_filter.statement_cost_limit = 10000;

-- authenticated users can run more expensive queries
ALTER
  USER authenticated
SET
  plan_filter.statement_cost_limit = 1e6;


-- Tell PostgREST to reload config
NOTIFY pgrst, 'reload config';

