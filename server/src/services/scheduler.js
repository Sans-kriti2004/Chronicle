import cron from 'node-cron';

export function startSchedulers() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Chronicle escalation check placeholder ran at 9am.');
  });
}
