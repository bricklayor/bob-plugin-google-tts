// main.js — Google Cloud Text-to-Speech (Chirp 3) Bob Plugin
// Supports: Chirp 3 HD high-fidelity generative voices, multi-language mapping,
//           custom domain/proxy, custom voices, audio encoding selection, and Bob plugin validation.

// ---------------------------------------------------------------------------
// Language Support Definitions
// ---------------------------------------------------------------------------

var BOB_SUPPORTED_LANGUAGES = [
  "auto",
  "zh-Hans",
  "zh-Hant",
  "yue",
  "en",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "it",
  "ru",
  "pt",
  "nl",
  "pl",
  "ar",
  "th",
  "vi",
  "id",
  "hi",
  "tr",
  "el",
  "cs",
  "da",
  "fi",
  "sv",
  "he",
  "hu",
  "ro",
  "uk",
  "nb",
  "sk",
  "bg",
  "bn"
];

// Map Bob language identifiers to Google Cloud Text-to-Speech locale codes
var BOB_TO_GOOGLE_LOCALE_MAP = {
  "zh-Hans": "cmn-CN",
  "zh-CHS": "cmn-CN",
  "zh-CN": "cmn-CN",
  "zh": "cmn-CN",
  "zh-Hant": "cmn-CN",
  "zh-CHT": "cmn-CN",
  "zh-TW": "cmn-CN",
  "zh-HK": "cmn-CN",
  "yue": "yue-HK",
  "en": "en-US",
  "en-US": "en-US",
  "en-GB": "en-GB",
  "en-AU": "en-AU",
  "ja": "ja-JP",
  "ko": "ko-KR",
  "fr": "fr-FR",
  "fr-CA": "fr-CA",
  "de": "de-DE",
  "es": "es-ES",
  "es-US": "es-US",
  "it": "it-IT",
  "ru": "ru-RU",
  "pt": "pt-BR",
  "pt-PT": "pt-BR",
  "nl": "nl-NL",
  "pl": "pl-PL",
  "ar": "ar-XA",
  "th": "th-TH",
  "vi": "vi-VN",
  "id": "id-ID",
  "hi": "hi-IN",
  "tr": "tr-TR",
  "el": "el-GR",
  "cs": "cs-CZ",
  "da": "da-DK",
  "fi": "fi-FI",
  "sv": "sv-SE",
  "he": "he-IL",
  "hu": "hu-HU",
  "ro": "ro-RO",
  "uk": "uk-UA",
  "nb": "nb-NO",
  "no": "nb-NO",
  "sk": "sk-SK",
  "bg": "bg-BG",
  "bn": "bn-IN"
};

/**
 * Bob standard entry point for reporting supported languages.
 */
function supportLanguages() {
  return BOB_SUPPORTED_LANGUAGES.slice();
}

exports.supportLanguages = supportLanguages;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clean and resolve base API URL.
 * @param {string} custom - Value from $option.custom_domain
 * @returns {string}
 */
function resolveBaseUrl(custom) {
  var base = (custom || "").trim();
  if (base.length === 0) {
    base = "https://texttospeech.googleapis.com";
  }
  return base.replace(/\/+$/, "");
}

/**
 * Map HTTP status code to Bob error type.
 * @param {number} status
 * @returns {string}
 */
function httpStatusToErrorType(status) {
  if (status === 401 || status === 403) return "secretKey";
  if (status >= 400 && status < 500) return "param";
  return "api";
}

/**
 * Detect primary language of text when language is set to 'auto' or undefined.
 * @param {string} text
 * @returns {string} Bob language code
 */
function detectLanguageFromText(text) {
  if (!text) return "en";
  if (/[\u4e00-\u9fa5]/.test(text)) return "zh-Hans";
  if (/[\u3040-\u30ff]/.test(text)) return "ja";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u0400-\u04ff]/.test(text)) return "ru";
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  return "en";
}

/**
 * Resolve voice name and languageCode based on query and plugin options.
 * @param {string} queryLang - Language code passed by Bob
 * @param {string} queryText - Text to be synthesized
 * @param {object} opts - Plugin options ($option)
 * @returns {{languageCode: string, voiceName: string}}
 */
function resolveVoice(queryLang, queryText, opts) {
  opts = opts || {};
  var customVoice = (opts.custom_voice || "").trim();
  if (customVoice.length > 0) {
    // Extract language code from voice name if standard pattern e.g. en-US-Chirp3-HD-Charon
    var parts = customVoice.split("-");
    var customLangCode = parts.length >= 2 ? parts[0] + "-" + parts[1] : "en-US";
    return {
      languageCode: customLangCode,
      voiceName: customVoice
    };
  }

  var targetLang = queryLang;
  if (!targetLang || targetLang === "auto") {
    targetLang = detectLanguageFromText(queryText);
  }

  var locale = BOB_TO_GOOGLE_LOCALE_MAP[targetLang] || "en-US";

  var voiceName;
  if (locale === "cmn-CN") {
    voiceName = (opts.zh_voice || opts.chinese_voice || "cmn-CN-Chirp3-HD-Kore").trim();
  } else if (locale === "en-US") {
    voiceName = (opts.en_voice || opts.english_voice || "en-US-Chirp3-HD-Charon").trim();
  } else if (locale === "yue-HK") {
    voiceName = (opts.yue_voice || "yue-HK-Chirp3-HD-Kore").trim();
  } else if (locale === "ja-JP") {
    voiceName = (opts.ja_voice || "ja-JP-Chirp3-HD-Kore").trim();
  } else if (locale === "ko-KR") {
    voiceName = (opts.ko_voice || "ko-KR-Chirp3-HD-Kore").trim();
  } else if (locale === "fr-FR" || locale === "fr-CA") {
    voiceName = (opts.fr_voice || "fr-FR-Chirp3-HD-Kore").trim();
  } else if (locale === "de-DE") {
    voiceName = (opts.de_voice || "de-DE-Chirp3-HD-Kore").trim();
  } else if (locale === "es-ES" || locale === "es-US") {
    voiceName = (opts.es_voice || "es-ES-Chirp3-HD-Kore").trim();
  } else if (locale === "ru-RU") {
    voiceName = (opts.ru_voice || "ru-RU-Chirp3-HD-Aoede").trim();
  } else if (locale === "it-IT") {
    voiceName = (opts.it_voice || "it-IT-Chirp3-HD-Kore").trim();
  } else {
    var genderPersonality = (opts.other_voice_gender || "Kore").trim();
    voiceName = locale + "-Chirp3-HD-" + genderPersonality;
  }

  return {
    languageCode: locale,
    voiceName: voiceName
  };
}

// ---------------------------------------------------------------------------
// Core TTS Function
// ---------------------------------------------------------------------------

/**
 * Main Bob Text-to-Speech synthesis implementation.
 * @param {object} query - TTS query object from Bob
 * @param {function} completion - Bob completion callback
 */
function tts(query, completion) {
  var done = typeof completion === "function" ? completion : (query && query.onCompletion);
  if (typeof done !== "function") {
    done = function () {};
  }

  var opts = typeof $option !== "undefined" ? $option : {};
  var apiKey = (opts.api_key || "").trim();

  if (!apiKey) {
    done({
      error: {
        type: "secretKey",
        message: "未填写 Google Cloud API Key，请在 Bob 插件设置中填写有效密钥后再试。"
      }
    });
    return;
  }

  var text = (query && query.text ? query.text : "").trim();
  if (!text) {
    done({
      error: {
        type: "param",
        message: "朗读文本内容为空。"
      }
    });
    return;
  }

  var voiceConfig = resolveVoice(query && query.lang, text, opts);
  var baseUrl = resolveBaseUrl(opts.custom_domain);
  var audioEncoding = (opts.audio_encoding || "MP3").trim();

  var url = baseUrl + "/v1/text:synthesize";
  var requestBody = {
    input: {
      text: text
    },
    voice: {
      languageCode: voiceConfig.languageCode,
      name: voiceConfig.voiceName
    },
    audioConfig: {
      audioEncoding: audioEncoding
    }
  };

  $http.request({
    method: "POST",
    url: url,
    header: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Goog-Api-Key": apiKey
    },
    body: requestBody,
    handler: function (resp) {
      if (resp.error) {
        done({
          error: {
            type: "network",
            message: resp.error.localizedDescription || "网络连接异常，无法连接 Google TTS 服务",
            addition: JSON.stringify(resp.error)
          }
        });
        return;
      }

      var status = resp.response && resp.response.statusCode;
      if (status && status >= 400) {
        var errMessage = "Google TTS 请求失败 (HTTP " + status + ")";
        var errDetail = "";
        try {
          if (resp.data && resp.data.error) {
            errMessage = resp.data.error.message || errMessage;
            errDetail = JSON.stringify(resp.data.error);
          } else {
            errDetail = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
          }
        } catch (_) {
          errDetail = String(resp.data);
        }

        done({
          error: {
            type: httpStatusToErrorType(status),
            message: errMessage,
            addition: errDetail
          }
        });
        return;
      }

      var data = resp.data;
      if (data && data.audioContent) {
        done({
          result: {
            type: "base64",
            value: data.audioContent,
            raw: data
          }
        });
      } else {
        done({
          error: {
            type: "api",
            message: "Google TTS 未返回有效音频数据",
            addition: JSON.stringify(data)
          }
        });
      }
    }
  });
}

exports.tts = tts;

// ---------------------------------------------------------------------------
// Plugin Validation (Bob 1.6.0+)
// ---------------------------------------------------------------------------

/**
 * Validate plugin configuration and API key.
 * Synthesizes a minimal text token to verify end-to-end API accessibility.
 * @param {function} completion
 */
function pluginValidate(completion) {
  var opts = typeof $option !== "undefined" ? $option : {};
  var apiKey = (opts.api_key || "").trim();

  if (!apiKey) {
    completion({
      result: false,
      error: {
        type: "secretKey",
        message: "未填写 Google Cloud API Key，请先填入有效密钥后再执行验证。"
      }
    });
    return;
  }

  var baseUrl = resolveBaseUrl(opts.custom_domain);
  var url = baseUrl + "/v1/text:synthesize";

  $http.request({
    method: "POST",
    url: url,
    header: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Goog-Api-Key": apiKey
    },
    body: {
      input: {
        text: "Hi"
      },
      voice: {
        languageCode: "en-US",
        name: "en-US-Chirp3-HD-Charon"
      },
      audioConfig: {
        audioEncoding: "MP3"
      }
    },
    handler: function (resp) {
      if (resp.error) {
        completion({
          result: false,
          error: {
            type: "network",
            message: "网络请求失败: " + (resp.error.localizedDescription || "请检查网络或代理设置")
          }
        });
        return;
      }

      var status = resp.response && resp.response.statusCode;
      if (status && status >= 400) {
        var msg = "API 验证失败 (HTTP " + status + ")";
        try {
          if (resp.data && resp.data.error && resp.data.error.message) {
            msg = resp.data.error.message;
          }
        } catch (_) {}

        completion({
          result: false,
          error: {
            type: httpStatusToErrorType(status),
            message: msg
          }
        });
        return;
      }

      if (resp.data && resp.data.audioContent) {
        completion({
          result: true
        });
      } else {
        completion({
          result: false,
          error: {
            type: "api",
            message: "服务已响应但未返回音频数据"
          }
        });
      }
    }
  });
}

exports.pluginValidate = pluginValidate;

// ---------------------------------------------------------------------------
// Testing exports
// ---------------------------------------------------------------------------
exports.__test = {
  resolveBaseUrl: resolveBaseUrl,
  httpStatusToErrorType: httpStatusToErrorType,
  detectLanguageFromText: detectLanguageFromText,
  resolveVoice: resolveVoice,
  BOB_SUPPORTED_LANGUAGES: BOB_SUPPORTED_LANGUAGES,
  BOB_TO_GOOGLE_LOCALE_MAP: BOB_TO_GOOGLE_LOCALE_MAP
};
