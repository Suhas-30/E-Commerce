import redis from 'redis';

const user = redis.createClient({
  url: 'redis://redis:6379',
});

user.on('error', (err) => {
  console.error('Redis connection error:', err);
});

(async () => {
  try {
    await user.connect();
    console.log('✅ Redis client connected');
  } catch (err) {
    console.error('❌ Redis client failed to connect:', err);
  }
})();

export default user;
