sap.ui.define(["sap/ui/core/format/NumberFormat", "sap/ui/core/format/DateFormat", "sap/ui/model/ValidateException" ], function(N, D, V) {
    "use strict";
    return {

        CurrencyFormatter: function(value, currency) {
            if (!value) {
                return "";
            }

            return value.toLocaleString();
        },

        ValidateCurrencyValue: function(value) {
            if (value != 0) {
                throw new V("금액의 합은 0 이여야 합니다.");
            }
            return value;
        },

        InputValueState: function(value) {
            return value != 0 ? "Error" : "Success";
        },

        FormatStatus: function(s) {
            switch (s) {
            case "E":
                return "sap-icon://message-error";
            case "W":
                return "sap-icon://message-warning";
            case "S":
                return "sap-icon://message-success";
            }
        },
        formatWFButton: function(s){

        },
        formatHighlight: function(s) {
            switch (s) {
            case "E":
                return sap.ui.core.MessageType.Error;
            case "W":
                return sap.ui.core.MessageType.Warning;
            case "S":
                return sap.ui.core.MessageType.Success;
            case "I":
                return sap.ui.core.MessageType.Information;
            default:
                return sap.ui.core.MessageType.None;
            }
        },
        formatIconState: function(s) {
            switch (s) {
            case "E":
                return "sap-icon://status-error";
            case "W":
                return "sap-icon://status-critical";
            case "S":
                return "sap-icon://status-completed";
            case "I":
                return "sap-icon://status-inactive";
            default:
                return "";
            }
        },
        formatObjectStatusState: function(s) {
            switch (s) {
            case "E":
                return sap.ui.core.ValueState.Error;
            case "W":
                return sap.ui.core.ValueState.Warning;
            case "S":
                return sap.ui.core.ValueState.Success;
            case "I":
                return sap.ui.core.ValueState.Information;
            default:
                return sap.ui.core.ValueState.None;
            }
        },
        formatObjectStatusText: function(s) {
            switch (s) {
            case "E":
                return "Error";
            case "W":
                return "Warning";
            case "S":
                return "Success";
            case "I":
                return "Information";
            default:
                return "";
            }
        },
        FormatHighlight: function(s) {
            switch (s) {
            case "E":
                return "Error";
            case "W":
                return "Warning";
            case "S":
                return "Success";
            }
        },
        FormatState: function(s) {
            switch (s) {
            case "E":
                return "Error";
            case "W":
                return "Warning";
            case "S":
                return "Success";
            case "I":
                return "Information";
            default:
                return "None";
            }
        },
        combineValueAndDes: function(v, d) {
            if (d) {
                return v + " (" + d + ")";
            } else {
                return v;
            }
        },
        FormatterStateText: function(s) {
            this.oBundle = this.getResourceBundle();
            if (s === "E") {
                return this.oBundle.getText("STS_ERROR");
            }
            if (s === "W") {
                return this.oBundle.getText("STS_WARNING");
            }
            if (s === "S") {
                return this.oBundle.getText("STS_SUCCESS");
            }
            if (s === "I") {
                return this.oBundle.getText("STS_INFORMATION");
            }
        },
        FormatRowCount: function(t) {
            var h = $(window).height();
            var s = parseInt((h - 300) / 55);
            return s;
        },
        FormatDateTime: function(d, t) {
            if (!d) {
                return;
            }
            var f = t ? sap.ui.core.format.DateFormat.getTimeInstance() : sap.ui.core.format.DateFormat.getDateInstance();
            return f.format(d);
        },
        FormatDate: function(d) {
            if (d) {
                var l = sap.ui.getCore().getConfiguration().getLocale();
                var f = sap.ui.getCore().getConfiguration().getFormatSettings();
                var p = f.getDatePattern("short");
                var a = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: p
                }, l);
                return a.format(d);
            }
            return "";
        },
        formatAppendDescript: function(k, t) {
            if (!k) {
                return "";
            } else if (!t) {
                return k;
            }
            return k + " (" + t + ")";
        },
        FormatValueText: function(v, V) {
            if (v && V) {
                return v + " " + V;
            } else {
                if (v) {
                    return v;
                }
            }
        },
        timestampToDateTime: function(t) {
            var d = t.toDateString();
            return d;
        },
        FormatCnsldtnTaskType: function(c, s) {
            var r = c + " " + s;
            return r;
        },
        FormatCnsldtnVersion: function(v, V) {
            var r = v + " " + V;
            return r;
        },
        FormatFiscalYear: function(y, p) {
            var r = p + "." + y;
            return r;
        },
        FormatUserId: function(u) {
            var r = u;
            return r;
        },
        FormatTestRun: function(t) {
            var r;
            if (t === "true" || t === true) {
                r = this.getResourceBundle().getText("Yes");
            } else {
                r = this.getResourceBundle().getText("No");
            }
            return r;
        },
        FormatCnsldtnlineitemtype: function(t) {
            if (t === "DO") {
                return true;
            } else {
                return false;
            }
        },
        FormatCumulative: function(v) {
            if (v === true) {
                return this.getResourceBundle().getText("Cumulative");
            } else {
                return this.getResourceBundle().getText("Periodical");
            }
        },
        FormatUpdateMode: function(v) {
            switch (v) {
            case "1":
                return this.getResourceBundle().getText("UpdateMode1");
            case "2":
                return this.getResourceBundle().getText("UpdateMode2");
            case "3":
                return this.getResourceBundle().getText("UpdateMode3");
            case "4":
                return this.getResourceBundle().getText("UpdateMode4");
            case "A":
                return this.getResourceBundle().getText("UpdateModeA");
            case "B":
                return this.getResourceBundle().getText("UpdateModeB");
            case "C":
                return this.getResourceBundle().getText("UpdateModeC");
            case "D":
                return this.getResourceBundle().getText("UpdateModeD");
            }
        },
        CombineUpdateDesc: function(v) {
            var a;
            switch (v) {
            case "1":
                a = this.getResourceBundle().getText("UpdateMode1");
                break;
            case "2":
                a = this.getResourceBundle().getText("UpdateMode2");
                break;
            case "3":
                a = this.getResourceBundle().getText("UpdateMode3");
                break;
            case "4":
                a = this.getResourceBundle().getText("UpdateMode4");
                break;
            case "A":
                a = this.getResourceBundle().getText("UpdateModeA");
                break;
            case "B":
                a = this.getResourceBundle().getText("UpdateModeB");
                break;
            case "C":
                a = this.getResourceBundle().getText("UpdateModeC");
                break;
            case "D":
                a = this.getResourceBundle().getText("UpdateModeD");
            }
            var m = v + " (" + a + ")";
            return m;
        },
        FormatCurrency: function(a, c) {
            if (a && c) {
                var o = sap.ui.core.format.NumberFormat.getCurrencyInstance();
                o.oFormatOptions.pattern = "#,##0.00";
                var r = o.format(a, c);
                return r;
            } else {
                return "";
            }
        },
        FormatAmount: function(a) {
            if (a) {
                var c = sap.ui.core.format.NumberFormat.getCurrencyInstance();
                return c.format(a);
            } else {
                return "";
            }
        },
        timestampInList: function(t) {
            if (!t) {
                return "";
            }
            var d = D.getDateTimeInstance({
                "style": "short"
            });
            return d.format(t);
        },
        timestampInDetail: function(t) {
            if (!t) {
                return "";
            }
            var d = D.getDateTimeInstance();
            return d.format(t);
        },
        formatRowHighlight: function(s) {
            if (s === "E") {
                return "Error";
            } else if (s === "W") {
                return "Warning";
            } else if (s === "S") {
                return "Success";
            } else if (s === "I") {
                return "Information";
            } else {
                return "None";
            }
        },
        formatMsgLongText: function(s) {}
    };
});