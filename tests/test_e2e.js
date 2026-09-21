// tests/test_e2e.js — Real Google Cloud TTS API integration test
const assert = require("assert");
const plugin = require("../src/main.js");

const apiKey = process.env.GOOGLE_TTS_KEY;
if (!apiKey) {
  console.log("Skipping E2E test: GOOGLE_TTS_KEY environment variable not set.");
  process.exit(0);
}

// Implement minimal $http using standard fetch
global.$http = {
  request: async function (options) {
    try {
      const resp = await fetch(options.url, {
        method: options.method,
        headers: options.header,
        body: JSON.stringify(options.body)
      });
      const data = await resp.json();
      options.handler({
        response: { statusCode: resp.status },
        data: data
      });
    } catch (err) {
      options.handler({
        error: { localizedDescription: err.message }
      });
    }
  }
};

global.$option = {
  api_key: apiKey,
  chinese_voice: "cmn-CN-Chirp3-HD-Kore",
  english_voice: "en-US-Chirp3-HD-Charon",
  audio_encoding: "MP3"
};

console.log("=== Running End-to-End API Integration Tests ===");

// 1. Test pluginValidate
plugin.pluginValidate(function (res) {
  console.log("pluginValidate result:", res);
  assert(res.result === true, "pluginValidate must succeed with valid GOOGLE_TTS_KEY");
  console.log("✓ pluginValidate() passed with live Google Cloud TTS API");

  // 2. Test tts for Chinese Chirp 3 HD
  plugin.tts(
    {
      text: "你好，这是使用 Chirp 3 高清语音插件的端到端集成测试。",
      lang: "zh-Hans"
    },
    function (ttsRes) {
      assert(ttsRes.result, "TTS Chinese synthesis must return result");
      assert.strictEqual(ttsRes.result.type, "base64");
      assert(ttsRes.result.value && ttsRes.result.value.length > 500, "Must return substantial audio data");
      console.log("✓ Chinese Chirp 3 HD synthesis passed, audio bytes length:", ttsRes.result.value.length);

      // 3. Test tts for English Chirp 3 HD
      plugin.tts(
        {
          text: "Hello, this is a real-time integration test with Chirp 3 HD.",
          lang: "en"
        },
        function (enRes) {
          assert(enRes.result, "TTS English synthesis must return result");
          assert.strictEqual(enRes.result.type, "base64");
          assert(enRes.result.value && enRes.result.value.length > 500, "Must return substantial audio data");
          console.log("✓ English Chirp 3 HD synthesis passed, audio bytes length:", enRes.result.value.length);
          console.log("\nAll E2E live tests passed successfully!");
        }
      );
    }
  );
});
