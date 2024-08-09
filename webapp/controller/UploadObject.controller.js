sap.ui.define([
    "pgdc0020_1/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageItem",
    "sap/m/MessageView",
    "sap/m/Dialog",
    "pgdc0020_1/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
    "sap/ui/comp/navpopover/LinkData",
    "sap/ui/core/format/NumberFormat",
    "sap/ushell/services/CrossApplicationNavigation",
    "sap/m/MessageBox"
], 
function( 
    BaseController, 
    JSONModel, 
    History, 
    MessageItem, 
    MessageView, 
    Dialog, 
    formatter, 
    Filter, 
    FilterOperator, 
    Sorter, 
    NavigationHandler, 
    LinkData,
    NumberFormat,
    CrossApplicationNavigation,
    MessageBox) {

    "use strict";
    var _vFlg;
    var oTable;
    return BaseController.extend("pgdc0020_1.controller.UploadObject", {
        formatter: formatter,
        spath: "",
        aMessages: [],
        aUnitMessages: [],
        sLogID: "",
        oFra: null,
        oTable: null,
        oMsgTable: null,
        oTableEvent: null,
        oFilter: null,
        _bNewReportLogic: false,
        onInit: function () {
            this._initModel();
            this.getRouter().getRoute("UploadObject").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function(e) {
            this.oPlaceholderContainer = e.getParameter("targetControl");
            this.getView().byId("splitter").setHeight("90%")
            this.getView().byId("splitter").setHeight("100%")
            var smartTable = sap.ui.core.Fragment.byId("Fra", "pgdc0020_1.smarttable.upload");
            if(smartTable){
                // this._readyToSmartTable(smartTable);
                smartTable.getTable().getRows().unbindRows();
            } else {
                // this._onBindingChange();
            }
            var uploadedStatus = this.getView().getModel('uploadedStatus')
        },

        _initModel: function() {
            var v = new JSONModel({
                busy: false,
                delay: 0,
                uploaded: false,
                TaskStatus: ""
            });
            this.setModel(v, "objectView");
            
        },

        _onBindingChange: function() {
            this._initFragment();
        },
        
        _initFragment: function() {
            if (this.oFra) {
                this.oFra.destroy();
            }
            var s = "Fra",
                r = sap.ui.xmlfragment(s, "pgdc0020_1.view.fragments.LogDetail", this);
        
            var p = new sap.m.Page("page2");
            this.oFra = p;
            this.oFra.setShowHeader(false);
            this.getView().addDependent(r);
            this.getView().addDependent(p);
            p.addContent(r);
            this.byId("app").addPage(p);
        },

        bindingInputData: function (e) {
            var i = e.getSource();
            var s = i.getValueState();
            var d = e.getParameter('value');
            if(d != '0'){
                i.setValueState('Error')
            } else {
                i.setValueState('Success')
            }
            var oModel = this.getView().getModel('headerModel')
            oModel.bindProperty("/Hslt", oContext, {
                mode: sap.ui.model.BindingMode.OneWay
            });
            oModel.bindProperty("/Rhcur", oContext, {
                mode: sap.ui.model.BindingMode.OneWay
            });
        },

        onToolbarCurrencyCheckPress: function(E) {
            var LocalCurrencyInput = sap.ui.core.Fragment.byId("Fra", "LocalCurrencyInput");
            var GroupCurrencyInput = sap.ui.core.Fragment.byId("Fra", "GroupCurrencyInput");
            var smartTable = sap.ui.core.Fragment.byId("Fra", "pgdc0020_1.smarttable.upload");
            var oTable = smartTable.getTable();
            this._readyToSmartTable(smartTable);
        
            var fTotalHsl = 0;
            var fTotalKsl = 0;
        
            var oBinding = oTable.getBinding("rows");
            var aContexts = oBinding.getContexts();
        
            aContexts.forEach(function(oContext) {
                var sPath = oContext.sPath;
                var oData = this.getView().getModel().getData(sPath);
        
                fTotalHsl += this._parseValue(oData.LocalCurrencyAmount);
                fTotalKsl += this._parseValue(oData.GroupCurrencyAmount);
            }.bind(this));
        
            LocalCurrencyInput.setValue(fTotalHsl);
            GroupCurrencyInput.setValue(fTotalKsl);
            this._runValueStateFormatter(LocalCurrencyInput);
            this._runValueStateFormatter(GroupCurrencyInput);
        
            var sValueState1 = LocalCurrencyInput.getValueState();
            var sValueState2 = GroupCurrencyInput.getValueState();
        
            if (sValueState1 === "Success" && sValueState2 === "Error") {
                GroupCurrencyInput.focus();
            } else {
                LocalCurrencyInput.focus();
            }
        },
        
        _parseValue: function(sValue) {
            if (typeof sValue === "string") {
                sValue = sValue.replace(/,/g, '');
                return parseFloat(sValue) || 0;
            }
            return sValue || 0;
        },
        
        _runValueStateFormatter: function(oInputField) {
            var v = oInputField.getValue();
            var s = formatter.InputValueState(v);
            oInputField.setValueState(s);
        },

        onToolbarAccountCheckPress: function(E) {

            var oModel = this.getView().getModel();
            oModel.callFunction("/Bulk_Import_and_Update", {
                method: "POST",
                success: function (e) {
                    console.log(e)
                },
                error: function (e) {
                    console.log(e)
                }
            });

        },

        _highlightRows: function(oRow, s) {
           var S = formatter.formatRowHighlight(s);
           oRow.getAggregation('_settings').setProperty('highlight', S)
        },

        onToolbarAccountMappingPress : function(){
            var _t = this;
            var smartTable = sap.ui.core.Fragment.byId("Fra", "pgdc0020_1.smarttable.upload");
            var oTable = smartTable.getTable();
            var s = oTable.getSelectedIndices();
            if( s.length > 1 || s.length < 1){
                MessageBox.warning(
                    "한 건의 계정매핑내역을 선택해주세요", {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (oAction) {

                        }
                    }
                );   
                return;         
            }
            var r = oTable.getRows()[s];
            var o = r.getBindingContext().getObject();
            var model = this.getView().getModel();
            var aFilter = [
                new sap.ui.model.Filter("Ritclg", sap.ui.model.FilterOperator.EQ, o.CnsldtnCOA),
                new sap.ui.model.Filter("Rbunit", sap.ui.model.FilterOperator.EQ, o.CnsldtnUnit),
                new sap.ui.model.Filter("Revision", sap.ui.model.FilterOperator.EQ, o.Revision),
                new sap.ui.model.Filter("Rvers", sap.ui.model.FilterOperator.EQ, o.FSMapVer),
                new sap.ui.model.Filter("Ryear", sap.ui.model.FilterOperator.EQ, o.FscalYr),
                new sap.ui.model.Filter("Poper", sap.ui.model.FilterOperator.EQ, o.PrvsPrd)
            ];
            
            var oCombinedFilter = new sap.ui.model.Filter({
                filters: aFilter,
                and: true
            });
            
            console.log(aFilter)

            model.read('/GRVCOA02',{
                filters : oCombinedFilter,
                success : function (d) {
                    var oObjectId = d.results[0].Uuid;
                    _t.onNavigateButtonPress(oObjectId);
                }
            })
        
        },

        onNavigateButtonPress: function (oObjectId) {
            var sSemanticObject = "pgdc0010";
            var sAction = "display";
            var sObjectId = oObjectId

            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

            var oHash = oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: sSemanticObject,
                    action: sAction
                },
                params: {
                    "objectId": sObjectId
                }
            });

            var sHash = oHash + "/Detail/" + sObjectId;

            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: sHash
                }
            });
        },

        onHeaderDetail: function (e) {
            var d = e.getParameter('row').getBindingContext().getObject();
            console.log(d)
            this.getRouter().navTo('Detail',{
                objectId : `(Ritclg=${d.Ritclg},Rvers=${d.Rvers},Ryear=${d.Ryear},Poper=${d.Poper},Rbunit=${d.Rbunit},Revision=${d.Revision},)` }
            )
        },


        initTable: function(e) {
            var _t = this,
            v = this.getView(),
            V = this.getModel("objectView"),
            oSmartTable = e.getSource(),
            oTable = oSmartTable.getTable();
            
            var r = V.getProperty('/uploaded');

            if(r){
                _t._readyToSmartTable(oSmartTable);
            } else {
                oTable.unbindRows();
            }
            V.setProperty("/busy", false);
            if(this.getView().byId("illustratedmessage") != undefined){
                this.getView().byId("illustratedmessage").destroy();
            }
         
        },

        _readyToSmartTable: function (oSmartTable) {
            var _t = this,
            v = this.getView(),
            V = this.getModel("objectView")

                oTable = oSmartTable.getTable();
                this.getModel().metadataLoaded().then(function() {
                    _t.smartTable = oSmartTable;
                    var path = _t.path;
                    this._bindView(path);
                    this._dataBindingTables();
                    this.getView().getModel().read(path, {
                        success: function(d, r) {
                            oTable.getParent().rebindTable();
                            oTable.getBinding("rows").filter(_t.sFilter);
                        }
                        .bind(this),
                        error: function(E) {
                        }
                    });
                   
                }
                .bind(this));  

        },

        _bindView: function(o) {
            this.getView().bindElement({
                path: o
            });
        },

        _dataBindingTables: function() {
            var t = this;
            var r = function() {
                var p = new Promise(function(c) {
                    t.smartTable.getTable().bindRows({
                        path: '/RprtdCnsldDraftEntity'
                    });
                    var e = function() {
                        if (c) {
                            c();
                        }
                    };
                    setTimeout(e, 0);
                }
                );
                return p;
            };
            r()
        },

        onBeforeRebindTable: function(e) {
            if (this.path) {
                e.getParameters().bindingParams.preventTableBind = true;
                e.getParameter("bindingParams").filters = this.filters;
            } else {
                // var m = Constants.MappingItemEntitySet;
                // e.getSource().setTableBindingPath(m);
                // e.getParameter("bindingParams").filters = this.filters;
            }
            // this._oBindingParamsMap = e.getParameter("bindingParams");
        },
     
        handleUploadPress: function (oEvent) {
            var oFileUploader = this.byId("pgdc0010.uploader"); // FileUploader ID
            var domRef = oFileUploader.getFocusDomRef();
            var file = oEvent.getParameter('files')[0];
            var reader = new FileReader();
        
            reader.onload = function (e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {
                    type: 'binary'
                });
        
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];
        
                var jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1
                });
        
                jsonData = jsonData.filter(row => row.some(cell => cell !== null && cell !== "" && cell !== undefined));
                var oModel = this._transformData(jsonData);
                this.getView().setModel(oModel, "reportTreeModel");
            }.bind(this);
        
            reader.readAsBinaryString(file);
        },

        _generateUUID: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        
        _transformData: function (data) {
            var parameters = {};
            var fieldNames = [];
            var entries = [];
            var requiredFields = [];
            var _t = this;
            var V = this.getModel("objectView");
            var treetable = this.getView().byId("reportTree");
            V.setProperty("/busy", true);
        
            var parentUUID = _t._generateUUID();
        
            data.forEach(function (row, rowIndex) {
                // 모든 값을 문자열로 변환
                row = row.map(function (cell) {
                    return cell !== undefined ? cell.toString() : "";
                });
            
                if (rowIndex === 0) {
                    return;
                }
            
                if (row[0] === '*D') {
                    fieldNames = row.slice(1).map(function (field) {
                        if (field.startsWith('*')) {
                            requiredFields.push(field.substring(1));
                            return field.substring(1);
                        }
                        return field;
                    });
                } else if (row[0] === 'P') {
                    parameters[row[1]] = row[2] !== undefined ? row[2].toString() : "";
                } else if (row[0] === '2') { 
                    var entry = {};
                    fieldNames.forEach(function (fieldName, colIndex) {
                        var value = row[colIndex + 1] !== undefined ? row[colIndex + 1].toString() : "";
                        if (fieldName === 'MSL') {
                            value = value !== "" && !isNaN(value) ? parseFloat(value).toFixed(2) : "0.00";
                        } else if (['HSL', 'KSL', 'TSL'].includes(fieldName)) {
                            value = value !== "" && !isNaN(value) ? parseFloat(value).toFixed(2) : "0.00";
                        }
                        entry[fieldName] = value;
                    });
                    entries.push(entry);
                }
            });
            
            
            
        
            var treeData = {
                name: "All",
                HLevel: 0,
                Hierarchy: "",
                children: []
            };
        
            var promises = entries.map(function (entry) {
                return _t.addEntryToTree(treeData, entry, parentUUID);
            });
            treetable.collapseAll();

            Promise.all(promises).then(function () {
                var oModel = _t.getModel();
                var filter = new sap.ui.model.Filter("ParentNode", sap.ui.model.FilterOperator.EQ, parentUUID);
                _t.filters = [filter];
                oModel.read("/RprtdCnsldDraftEntity", {
                    filters: [filter],
                    success: function (oData) {
                        var o = oData.results[0]
                        var aFilter = [
                            new sap.ui.model.Filter("Ritclg", sap.ui.model.FilterOperator.EQ, o.CnsldtnCOA),
                            new sap.ui.model.Filter("Rbunit", sap.ui.model.FilterOperator.EQ, o.CnsldtnUnit),
                            new sap.ui.model.Filter("Revision", sap.ui.model.FilterOperator.EQ, o.Revision),
                            new sap.ui.model.Filter("Rvers", sap.ui.model.FilterOperator.EQ, o.FSMapVer),
                            new sap.ui.model.Filter("Ryear", sap.ui.model.FilterOperator.EQ, o.FscalYr),
                            new sap.ui.model.Filter("Poper", sap.ui.model.FilterOperator.EQ, o.PrvsPrd)
                        ];

                        var sFilter = [
                                new sap.ui.model.Filter("CnsldtnCOA", sap.ui.model.FilterOperator.EQ, o.CnsldtnCOA),
                                new sap.ui.model.Filter("CnsldtnUnit", sap.ui.model.FilterOperator.EQ, o.CnsldtnUnit),
                                new sap.ui.model.Filter("Revision", sap.ui.model.FilterOperator.EQ, o.Revision),
                                new sap.ui.model.Filter("FSMapVer", sap.ui.model.FilterOperator.EQ, o.FSMapVer),
                                new sap.ui.model.Filter("FscalYr", sap.ui.model.FilterOperator.EQ, o.FscalYr),
                                new sap.ui.model.Filter("PrvsPrd", sap.ui.model.FilterOperator.EQ, o.PrvsPrd)
                        ];

                        _t.sFilter = sFilter;

                        _t.path = `/RprtdCnsldDraftEntity?$filter=CnsldtnCOA eq '${o.CnsldtnCOA}' and CnsldtnUnit eq '${o.CnsldtnUnit}' and Revision eq '${o.Revision}' and FSMapVer eq '${o.FSMapVer}' and FscalYr eq '${o.FscalYr}' and PrvsPrd eq '${o.PrvsPrd}'`;
                        // _t._checkUploadedDataWithSOAP(o);
                        V.setProperty("/uploaded", true);
                        var oCombinedFilter = new sap.ui.model.Filter({
                            filters: aFilter,
                            and: true
                        });

                        _t.filters = oCombinedFilter;
                        oModel.read("/GRVUPL01", {
                            filters: [oCombinedFilter],
                            success: function (oData) {
                                
                                var oHeaderModel = new sap.ui.model.json.JSONModel();
                                oHeaderModel.setData(oData.results[0]);
                                _t.getView().setModel(oHeaderModel, "headerModel");
                                console.log(oHeaderModel);
                                _t._initFragment();

                            },
                            error: function (oError) {
                            }
                        });
                    },
                    error: function (oError) {
                    }
                });
            });
        
            return new sap.ui.model.json.JSONModel({
                parameters: parameters,
                entries: [treeData]
            });
        },

        _checkUploadedDataWithSOAP: function(data) {
            var CreationDateTime = new Date().toISOString();
            var MessageID = `urn:uuid:${this._generateUUID()}`;
            var sUrl = '/sap/bc/srt/scs_ext/sap/fincs_rptdfindatabulkin';
            var userId = "Z_USER_REST";
            var userPw = "hzBHJdY6cBlWhgsaUUjltpQTeJeGf}qoFtlkVVsP";
        
            // SOAP 요청 메시지 생성
            var sRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                                            xmlns:fin="http://sap.com/xi/FIN-CS"
                                            xmlns:wsa="http://www.w3.org/2005/08/addressing">
                                <soapenv:Header>
                                    <wsa:MessageID>${MessageID}</wsa:MessageID>
                                    <wsa:Action>http://sap.com/xi/FIN-CS/ReportedFinancialDataBulkCreateRequestMessage</wsa:Action>
                                    <wsa:To>${sUrl}</wsa:To>
                                    <wsa:ReplyTo>
                                        <wsa:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa:Address>
                                    </wsa:ReplyTo>
                                </soapenv:Header>
                                <soapenv:Body>
                                    <fin:ReportedFinancialDataBulkCreateRequestMessage>
                                        <MessageHeader>
                                            <SenderBusinessSystemID></SenderBusinessSystemID>
                                            <CreationDateTime>${CreationDateTime}</CreationDateTime>
                                        </MessageHeader>
                                        <GlobalParameter>
                                            <SenderBusinessSystemID></SenderBusinessSystemID>
                                            <ConsolidationVersion>${data.FSMapVer}</ConsolidationVersion>
                                            <ConsolidationChartOfAccounts>${data.CnsldtnCOA}</ConsolidationChartOfAccounts>
                                            <FiscalYear>${data.FscalYr}</FiscalYear>
                                            <FiscalPeriod>${data.PrvsPrd}</FiscalPeriod>
                                        </GlobalParameter>
                                        <ActionControl>
                                            <UpdateMode>5</UpdateMode>
                                            <IsDataPeriodic>true</IsDataPeriodic>
                                            <ConsolidationDocumentType>7</ConsolidationDocumentType>
                                        </ActionControl>
                                        <ReportedFinancialDataCreateRequestMessage>
                                            <MessageHeader>
                                                <CreationDateTime>${CreationDateTime}</CreationDateTime>
                                                <TestDataIndicator>false</TestDataIndicator>
                                            </MessageHeader>
                                            <ReportedFinancialData>
                                                <ConsolidationUnit>${data.CnsldtnUnit}</ConsolidationUnit>
                                                <Item>
                                                    <RowNumber>1</RowNumber>
                                                    <PartnerConsolidationUnit>PRC</PartnerConsolidationUnit>
                                                    <FinancialStatementItem>${data.MasterFnclSmtItm}</FinancialStatementItem>
                                                    <SubitemCategory>1</SubitemCategory>
                                                    <Subitem>915</Subitem>
                                                    <AmountInTransactionCurrency currencyCode="${data.TransactionCurrency}">${data.TransactionCurrencyAmount}</AmountInTransactionCurrency>
                                                    <AmountInLocalCurrency currencyCode="${data.TransactionCurrency}">${data.LocalCurrencyAmount}</AmountInLocalCurrency>
                                                    <AmountInGroupCurrency currencyCode="${data.TransactionCurrency}">${data.GroupCurrencyAmount}</AmountInGroupCurrency>
                                                </Item>
                                            </ReportedFinancialData>
                                        </ReportedFinancialDataCreateRequestMessage>
                                    </fin:ReportedFinancialDataBulkCreateRequestMessage>
                                </soapenv:Body>
                            </soapenv:Envelope>`;
        
            // SOAP API 호출
            jQuery.ajax({
                url: sUrl,
                type: "POST",
                data: sRequest,
                dataType: "xml",
                contentType: "text/xml; charset=utf-8",
                headers: {
                    "Authorization": "Basic " + btoa(`${userId}:${userPw}`)
                },
                success: function(data, textStatus, jqXHR) {
                    console.log("SOAP API 호출 성공:", data);
        
                    // 성공적인 인바운드 요청 후 서버에서 아웃바운드 메시지 대기
                    this._waitForOutboundResponse(MessageID, CreationDateTime);
        
                }.bind(this),
                error: function(error) {
                    console.error("SOAP API 호출 실패:", error);
                }
            });
        },
        
        _waitForOutboundResponse: function(MessageID, CreationDateTime) {
            var outboundUrl = '/sap/bc/srt/scs_ext/sap/fincs_rptdfindatabulkin'; // 아웃바운드 메시지 URL
            var userId = "Z_USER_REST";
            var userPw = "hzBHJdY6cBlWhgsaUUjltpQTeJeGf}qoFtlkVVsP";
        
            // 주기적으로 아웃바운드 메시지를 폴링하여 수신
            setTimeout(function() {
                jQuery.ajax({
                    url: outboundUrl,
                    type: "POST",
                    data: this._generateOutboundRequest(MessageID, outboundUrl, CreationDateTime),
                    dataType: "xml",
                    contentType: "text/xml; charset=utf-8",
                    headers: {
                        "Authorization": "Basic " + btoa(`${userId}:${userPw}`)
                    },
                    success: function(data, textStatus, jqXHR) {
                        console.log("Outbound 메시지 수신 성공:", data);
                        // 아웃바운드 메시지 처리 로직 추가
                    },
                    error: function(error) {
                        console.error("Outbound 메시지 수신 실패:", error);
                    }
                });
            }.bind(this), 5000); // 5초 대기 후 요청
        },
        
        _generateOutboundRequest: function(MessageID, outboundUrl, CreationDateTime) {
            // 아웃바운드 요청 메시지 생성
            return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fin="http://sap.com/xi/FIN-CS">
                        <soapenv:Header>
                            <wsa:MessageID xmlns:wsa="http://www.w3.org/2005/08/addressing">${MessageID}</wsa:MessageID>
                            <wsa:Action xmlns:wsa="http://www.w3.org/2005/08/addressing">http://sap.com/xi/FIN-CS/ReportedFinancialDataBulkCreateConfirmationMessage</wsa:Action>
                            <wsa:To xmlns:wsa="http://www.w3.org/2005/08/addressing">${outboundUrl}</wsa:To>
                            <wsa:ReplyTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
                                <wsa:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa:Address>
                            </wsa:ReplyTo>
                        </soapenv:Header>
                        <soapenv:Body>
                            <fin:ReportedFinancialDataBulkCreateConfirmationMessage>
                                <MessageHeader>
                                    <ReferenceUUID>${MessageID}</ReferenceUUID>
                                    <CreationDateTime>${CreationDateTime}</CreationDateTime>
                                </MessageHeader>
                            </fin:ReportedFinancialDataBulkCreateConfirmationMessage>
                        </soapenv:Body>
                    </soapenv:Envelope>`;
        },

        _generateUUID: function() {
            // 간단한 UUID 생성 함수
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        addEntryToTree: function (parentNode, entry, parentUUID) {
            var rbunitNode = parentNode.children.find(function (child) {
                return child.name === entry.RBUNIT;
            });
        
            if (!rbunitNode) {
                rbunitNode = {
                    name: entry.RBUNIT,
                    HLevel: parentNode.HLevel + 1,
                    Hierarchy: parentNode.Hierarchy + "/" + entry.RBUNIT,
                };
                parentNode.children.push(rbunitNode);
            }
        
            return this.saveToDraftTable(entry, parentUUID);
        },
        
        saveToDraftTable: function (entry, parentUUID) {
            return new Promise((resolve, reject) => {
                var draftEntry = {
                    ParentNode: parentUUID,
                    Ritclg: entry.RITCLG,
                    Rvers : entry.RVERS,
                    Ryear : entry.RYEAR,
                    Poper : entry.POPER,
                    Rbunit: entry.RBUNIT,
                    Zracct: entry.ZRACCT,
                    Ritem : entry.RITEM,
                    Prbuptr: entry.PRBUPTR,
                    Runit : entry.RUNIT,
                    Msl: entry.MSL,
                    Hsl: entry.HSL,
                    Tsl: entry.TSL,
                    Ksl: entry.KSL ,
                    // Rtucr: entry.RTUCR,
                    Subit: entry.SUBIT,
                    Segment: entry.SEGMENT,
                    Sityp: entry.SITYP,
                    Prctr: entry.PRCTR,
                    Pprctr: entry.PPRCTR,
                    Psegment: entry.PSEGMENT,
                    Kokrs: entry.KOKRS,
                    Docty: '07'
                };
        
                this.getModel().create("/GRVUPL03", draftEntry, {
                    success: function (oData) {
                        this.getModel('uploadedStatus').setProperty('/WF01', true)
                        if (!this._draftEntryKeys) {
                            this._draftEntryKeys = [];
                        }
                        this._draftEntryKeys.push(oData.Uuid); // 생성된 드래프트의 키 또는 UUID를 저장
                            resolve();
                        }.bind(this),
                    error: function (oError) {
                        var errorMessage = "업로드 실패: " + (oError.message || "알 수 없는 오류");
                        sap.m.MessageToast.show(errorMessage); 
                        this.getModel('objectView').setProperty('/busy', false); 
                        reject();
                    }.bind(this)
                });
            });
        },

        onPressSave: function() {
            var _t = this;
            _t.getView().setBusy(true);

            if (!_t._draftEntryKeys || _t._draftEntryKeys.length === 0) {
                sap.m.MessageToast.show("활성화할 드래프트 데이터가 없습니다.");
                return;
            }
        
            var activatePromises = _t._draftEntryKeys.map(function(draftKey) {
                return new Promise((resolve, reject) => {
                    var sActivatePath = "/GRVUPL03Activate";
                    var oModel = _t.getModel();
                    oModel.callFunction(sActivatePath, {
                        method: "POST",
                        urlParameters: {
                            Uuid: draftKey,
                            IsActiveEntity: false
                        },
                        success: function(oData) {
                            _t.getView().setBusy(false);

                            resolve(oData);
                        },
                        error: function(oError) {
                            var errorMessage = "드래프트 활성화 실패: " + (oError.message || "알 수 없는 오류");
                            _t.getView().setBusy(false);
                            sap.m.MessageToast.show(errorMessage);
                            reject(oError);
                        }
                    });
                });
            });
        
            Promise.all(activatePromises)
                .then(function(results) {
                    sap.m.MessageToast.show("모든 드래프트가 성공적으로 임포트 되었습니다.");
                    _t.getModel('uploadedStatus').setProperty('/WF01', false)
                    _t.getModel('uploadedStatus').setProperty('/WF02', true)

                })
                .catch(function(error) {
                    console.error("드래프트 활성화 중 오류 발생:", error);
                });
        },

        onPressSend: function() {
            var _t = this;

            _t.getView().setBusy(true);
            
            if (!_t._draftEntryKeys || _t._draftEntryKeys.length === 0) {
                sap.m.MessageToast.show("전송할 드래프트 데이터가 없습니다.");
                _t.getView().setBusy(false);
                return;
            }
            var oModel = _t.getModel();
            
            var readPromises = _t._draftEntryKeys.map(function(draftKey) {
                return new Promise((resolve, reject) => {
                    var sPath = `/RprtdCnsldEntity(guid'${draftKey}')`;
                    oModel.read(sPath, {
                        success: function(oData) {
                            resolve(oData); 
                        },
                        error: function(oError) {
                            reject(oError); 
                        }
                    });
                });
            });
        
            // 모든 데이터를 조회한 후 SOAP API 호출
            Promise.all(readPromises)
                .then(function(results) {
                    results.forEach(function(data) {
                        console.log(data)
                        _t.getView().setBusy(false);
                        // 조회된 각 데이터로 SOAP API 호출
                        _t._checkUploadedDataWithSOAP(data);
                    });
                })
                .catch(function(error) {
                    console.error("드래프트 데이터 조회 중 오류 발생:", error);
                    _t.getView().setBusy(false);
                    sap.m.MessageToast.show("드래프트 데이터 조회 중 오류 발생.");
                });
        },
        
        
        

        onTaskLogPress() {
            this.getRouter().navTo("TaskLog");        
        }
        

        
        

        
        
        

    });
});
