import os
from redis import Redis
from rq import Queue

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
redis_connection = Redis.from_url(redis_url)

q = Queue(connection=redis_connection)