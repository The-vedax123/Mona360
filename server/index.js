import app from './app.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\n  Mona360 API running on http://localhost:${config.port}\n  Mona AI mode: ${
      config.openAiApiKey ? 'live LLM (key detected)' : 'smart mock (data-driven)'
    }\n`
  );
});
