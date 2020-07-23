import { savePageView, saveEvent } from 'lib/db';
import { allowPost } from 'lib/middleware';
import checkSession from 'lib/session';
import { createToken } from 'lib/crypto';

export default async (req, res) => {
  await allowPost(req, res);

  const session = await checkSession(req);

  const { website_id, session_id } = session;
  const { type, payload } = req.body;
  let ok = 1;

  if (type === 'pageview') {
    const { url, referrer } = payload;
    await savePageView(website_id, session_id, url, referrer).catch(e => {
      ok = 0;
      throw e;
    });
  } else if (type === 'event') {
    const { url, event_type, event_value } = payload;
    await saveEvent(website_id, session_id, url, event_type, event_value).catch(() => {
      ok = 0;
      throw e;
    });
  }

  const token = await createToken(session);

  res.status(200).json({ ok, session: token });
};