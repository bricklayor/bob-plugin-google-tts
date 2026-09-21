// tests/test_plugin.js — Comprehensive unit & integration tests for Google TTS Bob Plugin
const assert = require("assert");
const plugin = require("../src/main.js");

console.log("=== Running Unit Tests ===");

// 1. Test supportLanguages
const langs = plugin.supportLanguages();
assert(Array.isArray(langs), "supportLanguages must return an array");
assert(langs.includes("zh-Hans"), "Must include zh-Hans");
assert(langs.includes("en"), "Must include en");
assert(langs.includes("ja"), "Must include ja");
assert(langs.includes("auto"), "Must include auto");
console.log("✓ supportLanguages() verified (" + langs.length + " languages)");

// 2. Test resolveBaseUrl
const defaultUrl = plugin.__test.resolveBaseUrl("");
assert.strictEqual(defaultUrl, "https://texttospeech.googleapis.com");
const customUrl = plugin.__test.resolveBaseUrl("https://my-proxy.com///");
assert.strictEqual(customUrl, "https://my-proxy.com");
console.log("✓ resolveBaseUrl() verified");

// 3. Test httpStatusToErrorType
assert.strictEqual(plugin.__test.httpStatusToErrorType(401), "secretKey");
assert.strictEqual(plugin.__test.httpStatusToErrorType(403), "secretKey");
assert.strictEqual(plugin.__test.httpStatusToErrorType(400), "param");
assert.strictEqual(plugin.__test.httpStatusToErrorType(500), "api");
console.log("✓ httpStatusToErrorType() verified");

// 4. Test detectLanguageFromText
assert.strictEqual(plugin.__test.detectLanguageFromText("你好世界"), "zh-Hans");
assert.strictEqual(plugin.__test.detectLanguageFromText("こんにちは"), "ja");
assert.strictEqual(plugin.__test.detectLanguageFromText("안녕하세요"), "ko");
assert.strictEqual(plugin.__test.detectLanguageFromText("Hello world"), "en");
console.log("✓ detectLanguageFromText() verified");

// 5. Test resolveVoice
// 5.1 Chinese default
const zhVoice = plugin.__test.resolveVoice("zh-Hans", "你好", {});
assert.strictEqual(zhVoice.languageCode, "cmn-CN");
assert.strictEqual(zhVoice.voiceName, "cmn-CN-Chirp3-HD-Kore");

// 5.2 English default
const enVoice = plugin.__test.resolveVoice("en", "Hello", {});
assert.strictEqual(enVoice.languageCode, "en-US");
assert.strictEqual(enVoice.voiceName, "en-US-Chirp3-HD-Charon");

// 5.3 Japanese custom selection
const jaVoice = plugin.__test.resolveVoice("ja", "こんにちは", { ja_voice: "ja-JP-Chirp3-HD-Aoede" });
assert.strictEqual(jaVoice.languageCode, "ja-JP");
assert.strictEqual(jaVoice.voiceName, "ja-JP-Chirp3-HD-Aoede");

// 5.4 Cantonese custom selection
const yueVoice = plugin.__test.resolveVoice("yue", "你好", { yue_voice: "yue-HK-Chirp3-HD-Charon" });
assert.strictEqual(yueVoice.languageCode, "yue-HK");
assert.strictEqual(yueVoice.voiceName, "yue-HK-Chirp3-HD-Charon");

// 5.5 Korean custom selection
const koVoice = plugin.__test.resolveVoice("ko", "안녕하세요", { ko_voice: "ko-KR-Chirp3-HD-Fenrir" });
assert.strictEqual(koVoice.languageCode, "ko-KR");
assert.strictEqual(koVoice.voiceName, "ko-KR-Chirp3-HD-Fenrir");

// 5.6 Russian default selection
const ruVoice = plugin.__test.resolveVoice("ru", "Привет", {});
assert.strictEqual(ruVoice.languageCode, "ru-RU");
assert.strictEqual(ruVoice.voiceName, "ru-RU-Chirp3-HD-Aoede");

// 5.7 Custom voice override
const customVoice = plugin.__test.resolveVoice("zh-Hans", "你好", { custom_voice: "ja-JP-Chirp3-HD-Aoede" });
assert.strictEqual(customVoice.voiceName, "ja-JP-Chirp3-HD-Aoede");
assert.strictEqual(customVoice.languageCode, "ja-JP");
console.log("✓ resolveVoice() verified");

// 6. Test tts parameter validations
// 6.1 Missing API Key
global.$option = {};
plugin.tts({ text: "Hello" }, function (res) {
  assert(res.error, "Should return error when API key is missing");
  assert.strictEqual(res.error.type, "secretKey");
});

// 6.2 Empty text
global.$option = { api_key: "dummy-key" };
plugin.tts({ text: "   " }, function (res) {
  assert(res.error, "Should return error when text is empty");
  assert.strictEqual(res.error.type, "param");
});
console.log("✓ tts() input validation verified");

// 7. Mock $http test for successful TTS response
let mockRequested = false;
global.$http = {
  request: function (opts) {
    mockRequested = true;
    assert.strictEqual(opts.method, "POST");
    assert(opts.url.includes("/v1/text:synthesize"));
    assert.strictEqual(opts.header["X-Goog-Api-Key"], "mock-key");
    assert.strictEqual(opts.body.input.text, "Hello world");
    assert.strictEqual(opts.body.voice.name, "en-US-Chirp3-HD-Charon");

    opts.handler({
      response: { statusCode: 200 },
      data: { audioContent: "bW9jay1hdWRpby1kYXRh" }
    });
  }
};

global.$option = { api_key: "mock-key" };
plugin.tts({ text: "Hello world", lang: "en" }, function (res) {
  assert(res.result, "Should return result");
  assert.strictEqual(res.result.type, "base64");
  assert.strictEqual(res.result.value, "bW9jay1hdWRpby1kYXRh");
});
assert(mockRequested, "Mock request must have been triggered");
console.log("✓ tts() mock HTTP synthesis verified");

console.log("\nAll unit tests passed successfully!");
