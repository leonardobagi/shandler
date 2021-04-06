"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var callback_1 = __importDefault(require("./callback"));
var discord_js_1 = require("discord.js");
var FInteraction = /** @class */ (function () {
    function FInteraction(client, res, extras) {
        this.id = res.id;
        this.token = res.token;
        this.type = res.type;
        this.client = client;
        this.content = res.content;
        this.channel = extras.channel;
        this.member = extras.member;
        this.attachments = res.attachments;
        this.embeds = res.embeds;
        this.mentions = res.mentions;
        this.mentionRoles = res.mention_roles;
        this.guild = extras.guild;
        this.pinned = res.pinned;
        this.mentionEveryone = res.mention_everyone;
        this.tts = res.tts;
        this.timestamp = res.timestamp;
        this.editedTimestamp = res.edited_timestamp;
        this.flags = res.flags;
        this.webhookID = res.webhook_id;
        this.messageRefID = res.message_reference.message_id;
    }
    FInteraction.prototype.reply = function (res, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, type, apiMessage, _b, data, files;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.type, type = _a === void 0 ? 4 : _a;
                        if (!res)
                            throw new Error('content cannot be empty.');
                        if (res instanceof discord_js_1.APIMessage) {
                            apiMessage = res.resolveData();
                        }
                        else {
                            apiMessage = discord_js_1.APIMessage.create(this.channel, res, options);
                        }
                        return [4 /*yield*/, apiMessage.resolveFiles()];
                    case 1:
                        _b = _c.sent(), data = _b.data, files = _b.files;
                        // @ts-ignore
                        data.type = type;
                        return [2 /*return*/, this.client.api.webhooks(this.client.user.id, this.token)
                                .post({ data: data, files: files })
                                .then(function (m) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, callback_1.default(this, m)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                }
            });
        });
    };
    FInteraction.prototype.edit = function (content, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _a, type;
            var _this = this;
            return __generator(this, function (_b) {
                if (!content)
                    throw new Error('content can\'t be empty');
                data = discord_js_1.APIMessage.create(this.channel, content, options).data;
                _a = options.type.type, type = _a === void 0 ? 4 : _a;
                // @ts-ignore
                data.type = type;
                return [2 /*return*/, this.client.api.webhooks(this.client.user.id, this.token).messages(this.id)
                        .patch({ data: data })
                        .then(function (m) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, callback_1.default(this, m)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); })];
            });
        });
    };
    FInteraction.prototype.delete = function () {
        // @ts-ignore
        this.client.api.webhooks(this.client.user.id, this.token).messages(this.id).delete();
    };
    return FInteraction;
}());
exports.default = FInteraction;