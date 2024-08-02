sap.ui.define([
    "pgdc0020_1/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "pgdc0020_1/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
    "sap/ui/comp/navpopover/LinkData",
    "sap/ui/core/format/NumberFormat",
    "sap/m/MessageBox"
], 
function( 
    BaseController, 
    JSONModel,
    formatter, 
    Filter, 
    FilterOperator, 
    Sorter, 
    NavigationHandler, 
    LinkData,
    NumberFormat,
    MessageBox) {

    "use strict";
    var _vFlg;
    var oTable;
    return BaseController.extend("pgdc0020_1.controller.Detail", {
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
            this.getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function(e) {
            this.oPlaceholderContainer = e.getParameter("targetControl");
            var p = e.getParameter('arguments');

            this.sObjectId = p;
            if (typeof this.sObjectId === "undefined" || !this.sObjectId) {
                return;
            }

            function parseFilters(input) {
                var filterString = input.objectId;
                var keyValuePairs = filterString.slice(1, -2).split(',');
                var filters = {};

                keyValuePairs.forEach(function(pair) {
                    var [key, value] = pair.split('=');
                    filters[key] = value;
                });

                return filters;
            }

            var filters = parseFilters(p);
            
            this.filters = [
                new sap.ui.model.Filter("CnsldtnCOA", sap.ui.model.FilterOperator.EQ, filters.Ritclg),
                new sap.ui.model.Filter("FSMapVer", sap.ui.model.FilterOperator.EQ, filters.Rvers),
                new sap.ui.model.Filter("FscalYr", sap.ui.model.FilterOperator.EQ, filters.Ryear),
                new sap.ui.model.Filter("PrvsPrd", sap.ui.model.FilterOperator.EQ, filters.Poper),
                new sap.ui.model.Filter("CnsldtnUnit", sap.ui.model.FilterOperator.EQ, filters.Rbunit)
            ];
            
            
            this.path = `/RprtdCnsldDraftEntity?$filter=Ritclg eq '${filters.Ritclg}' and Rvers eq '${filters.Rvers}' and Ryear eq ${filters.Ryear} and Poper eq ${filters.Poper} and Rbunit eq '${filters.Rbunit}' and Revision eq '${filters.Revision}'`;

            var smartTable = sap.ui.core.Fragment.byId("Fra2", "pgdc0020_1.smarttable.upload");

            if(smartTable){
                this._readyToSmartTable(smartTable);
            } else {
                this._onBindingChange();
            }
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
            var s = "Fra2",
                r = sap.ui.xmlfragment(s, "pgdc0020_1.view.fragments.LogDetail", this);
        
            var p = new sap.m.Page("page3");
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
            
            var LocalCurrencyInput = sap.ui.core.Fragment.byId("Fra2", "LocalCurrencyInput");
            var GroupCurrencyInput = sap.ui.core.Fragment.byId("Fra2", "GroupCurrencyInput");
            var smartTable = sap.ui.core.Fragment.byId("Fra2", "pgdc0020_1.smarttable.upload");
            var oTable = smartTable.getTable();
            // this._readyToSmartTable(smartTable);
        
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
        
        // _parseValue 메소드
        _parseValue: function(sValue) {
            // sValue를 숫자로 변환하는 로직 구현
            return parseFloat(sValue) || 0;
        },
        
        // _runValueStateFormatter 메소드
        _runValueStateFormatter: function(oInput) {
            // oInput의 상태를 설정하는 로직 구현
            // 예: 값에 따라 ValueState를 설정하는 로직
            var fValue = parseFloat(oInput.getValue());
            if (fValue == 0) {
                oInput.setValueState("Success");
            } else {
                oInput.setValueState("Error");
            }
        },
        

        onToolbarAccountCheckPress: function(E) {
            var smartTable = sap.ui.core.Fragment.byId("Fra2", "pgdc0020_1.smarttable.upload");
            smartTable.rebindTable(true);
            var oTable = smartTable.getTable();
            var aRows = oTable.getRows();
            var _t = this;
            var aRowsToHighlight = [];

            aRows.forEach(function(oRow) {
                var s = oRow.getBindingContext().getObject().RowStatus
                _t._highlightRows(oRow, s);
            })

        },

        _highlightRows: function(oRow, s) {
           var S = formatter.formatRowHighlight(s);
           oRow.getAggregation('_settings').setProperty('highlight', S)
        },

        onToolbarAccountMappingPress : function(){
            var _t = this;
            var smartTable = sap.ui.core.Fragment.byId("Fra2", "pgdc0020_1.smarttable.upload");
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
            var aFilter = [];
            aFilter.push(new sap.ui.model.Filter("Ritclg", sap.ui.model.FilterOperator.EQ, o.CnsldtnCOA));
            aFilter.push(new sap.ui.model.Filter("Rbunit", sap.ui.model.FilterOperator.EQ, o.CnsldtnUnit));
            aFilter.push(new sap.ui.model.Filter("Revision", sap.ui.model.FilterOperator.EQ, o.Revision));

            model.read('/GRVCOA02',{
                filters : aFilter,
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

        onBeforeRebindTable: function(e) {
            if (this.sObjectId) {
                e.getParameters().bindingParams.preventTableBind = true;
                e.getParameter("bindingParams").filters = this.filters;
            } else {
                // var m = Constants.MappingItemEntitySet;
                // e.getSource().setTableBindingPath(m);
                // e.getParameter("bindingParams").filters = this.filters;
            }
            // this._oBindingParamsMap = e.getParameter("bindingParams");
        },


        initTable: function(e) {
            var _t = this,
            v = this.getView(),
            V = this.getModel("objectView"),
            oSmartTable = e.getSource(),
            oTable = oSmartTable.getTable();
            _t._readyToSmartTable(oSmartTable);
            V.setProperty("/busy", false);
            V.setProperty("/uploaded", true);
            if(this.getView().byId("illustratedmessage") != undefined){
                this.getView().byId("illustratedmessage").destroy();
            }
         
        },

        _readyToSmartTable: function (oSmartTable) {
            var _t = this,
            v = this.getView(),
            V = this.getModel("objectView")
            oTable = oSmartTable.getTable();

            oTable.unbindRows();
            this.getModel().metadataLoaded().then(function() {
                _t.smartTable = oSmartTable;
                var path = _t.path;
                this._bindView(path);
                this._dataBindingTables();
                this.getView().getModel().read(path, {
                    success: function(d, r) {
                        oTable.getParent().rebindTable(true);
                        oTable.getBinding("rows").filter(_t.filters);
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


        setHeaderData: function (params) {
        },

        

     
       
    })
})