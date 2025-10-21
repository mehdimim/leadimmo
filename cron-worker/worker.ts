export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      fetch('https://leadimmo.pages.dev/api/cron/generate-post', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CRON_TOKEN}`
        }
      })
    );
  },
  async fetch() {
    return new Response('leadimmo cron worker');
  }
};

export interface Env {
  CRON_TOKEN: string;
}
