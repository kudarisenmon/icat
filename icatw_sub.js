cssChange('//www.ipa.go.jp/security/announce/irss/reset_icatw.css');

var _phpPram = "icatw";

var _ImgPath = "//www.ipa.go.jp/security/announce/irss/img/" + _phpPram + "_img.png?001";	//画像を更新する際は末尾の数字をインクリメントすること

var _Width = 350;		//領域最大サイズ 横350
var _Height = 150;		//領域最大サイズ 縦150
var _BgColor = "";		//アイテム部背景色 初期値なし
var _FDateColor = "#0000FF";	//アイテム部更新日付文字色 初期値青
var _FTitleColor = "#000000";	//アイテム部タイトル文字色 初期値黒
var _ULineColor = "#000000";	//アイテム部リンク下線色 初期値 初期値黒
var _StrongBgColor = "#FFA500";	//強調表示背景色
var _StrongFColor = "#000000";	//強調表示文字色
var _StrongTerm = 7;	//強調期間
var _DocDateFlg = 1;	//更新日表示フラグ
var _ImgAdjustFlg = 1;	//画像の自動調整
var _ImgWAdjustPer = 25;	//画像の幅サイズ
var _ImgHAdjustPer = 22;	//画像の高さサイズ
var _ItemWAdjustPer = 100;	//アイテムテーブルの幅サイズ
var _ItemHAdjustPer = 75;	//アイテムテーブルの高さサイズ
var _urlChk = 1;	//URL形式チェック実施フラグ

var _divStyleF = "font-family : sans-serif !important; line-height:15px !important; font-size: 12px !important;";

var _errMsgEX = 'データの読込みに失敗しました。しばらくしてから、ページの再読込みをしてください。(IRSS-9001)';
var _errMsgTitle = 'IPAセキュリティセンター:重要なセキュリティ情報';
var _errRetry = 3;
var _timeout = 10000;
var errCount = 1;

var protocol = location.protocol;


function cssChange( file ){
    var link = document.createElement('link');
    with( link ) {
	href = file;type = 'text/css';
	rel = 'stylesheet';
    }
    var head = document.getElementsByTagName('head');
    head.item(0).appendChild(link);
}


function icatwCallback(data) {
    try {
	var htmlstrall="";
	var itemhtml="";

	//メッセージが設定されている場合、データを表示せずメッセージを表示して処理終了
	if(data.message != null){
	    var messageStr = _errMsgEX;
	    if(data.message != ""){
		messagestr = data.message;
	    };
	    errdisp(messagestr + "(" + data.messageid + ")");
	    return;
	}

	var ndate = new Date();	//本日日付
	var alldata = data;
	for(var i = 0; i <  alldata.itemdata.length; i++) {
	    //日付取得
	    var itemdata = alldata.itemdata[i];
	    var itemdate = htmlentities(itemdata.item_date);
	    
	    //アイテム作成日設定
	    var ryear = itemdate.substring(0,4);
	    var rmonth =  parseInt(itemdate.substring(5,7),10);
	    var rday = parseInt(itemdate.substring(8,10),10);
	    
	    //日付を2桁表示に変更
	    if (rmonth < 10) {rmonth = "0" + rmonth};
	    if (rday < 10) {rday = "0" + rday};
	    
	    var rdate = new Date(ryear+"/"+rmonth+"/"+rday);
	    var datedisp = ryear + "年" + rmonth + "月" + rday + "日";
	    
	    //強調判定
	    var wkBgColor = _BgColor;				//アイテム部背景色 初期値なし
	    var wkFDateColor = _FDateColor;	//アイテム部更新日付文字色 初期値青
	    var wkFTitleColor = _FTitleColor;	//アイテム部タイトル文字色 初期値黒
	    var wkULineColor = _ULineColor;	//アイテム部リンク下線色 初期値 初期値黒
	    if(_StrongTerm > 0){
		var nsabun = ndate.getTime() - rdate.getTime();
		nsabun=Math.floor( nsabun / (1000*60*60*24) );
		nsabun=nsabun+1;
		if (nsabun <= _StrongTerm){
		    wkBgColor = _StrongBgColor;
		    wkFDateColor = _StrongFColor;
		    wkFTitleColor = _StrongFColor;
		    wkULineColor = _StrongFColor;
		}
	    }
	    if(chkURL(data.itemdata[i].item_link)){	//URLcheck
		itemhtml += '<tr style="text-valign: top; background-color:' + wkBgColor + ' !important;">';
		itemhtml += '<td style="white-space:nowrap !important; overflow:hidden !important; border-bottom: 1px solid #9daab7 !important;">';
		itemhtml += '<a target="_blank" href="' + data.itemdata[i].item_link + '"';
		itemhtml += ' onMouseover="this.style.color=\'' + wkULineColor + '\'; this.style.textDecoration=\'underline\'; " onMouseout="this.style.textDecoration=\'none\'" >';
		itemhtml += '<span style="font-weight:bold; color:'+ wkFDateColor +';">' + datedisp + '</span>&nbsp;';
		itemhtml += '<span style="color:'+ wkFTitleColor +';">' + htmlentities(data.itemdata[i].item_title) + '</span></a></td></tr>';
	    };
	}

	var doc_link = "";
	var doc_udate = "";
	//URLcheck
	if(chkURL(data.docLink)){
	    doc_link = data.docLink;
	}

	//更新日表示フラグ有効の場合
	if(_DocDateFlg=='1'){
	    doc_udate= htmlentities(data.docDate);
	    doc_udate = "更新日:" + doc_udate.substring(0,4) + "年" + doc_udate.substring(5,7) + "月" + doc_udate.substring(8,10) + "日&nbsp;";
	}
	//画像自動調整有効の場合
	var img_style="";
	if(_ImgAdjustFlg=='1'){
	    img_style = 'width:'+ (_Width * (_ImgWAdjustPer/100)) +'px !important; height:'+ (_Height * (_ImgHAdjustPer/100)) +'px !important;';
	}
	//外枠
	htmlstrall += '<div style="height:'+ _Height + 'px !important; width:'+ _Width + 'px !important;' + _divStyleF + '" class="iparssreader_' + _phpPram + '">';
	//画像、ドキュメントタイトル
	htmlstrall += '<table><tbody>';
	htmlstrall += '<tr><td style="width:'+ (_Width * ((100-_ImgWAdjustPer)/100)) +'px !important;">' + doc_udate ;
	if(data.docTitleFix != null){htmlstrall += data.docTitle;} else {htmlstrall += htmlentities(data.docTitle);};
	htmlstrall += '</td>';
	htmlstrall += '<td style="text-align:center; vertical-align:middle; width:'+ (_Width * (_ImgWAdjustPer/100)) +'px !important; height:'+ (_Height * (_ImgHAdjustPer/100)) +'px !important;' + '">';
	if(doc_link!="") htmlstrall += '<a href="' + doc_link + '" target="_blank">';
	htmlstrall += '<img src="' + _ImgPath + '" style="border-style: none !important; ' + img_style + '">';
	if(doc_link!="") htmlstrall += '</a>';
	htmlstrall += '</td></tr>';
	htmlstrall += '</tbody></table>';
	//アイテムテーブル
	htmlstrall += '<div style="border-top: 1px solid #9daab7 !important; height:'+ (_Height*(_ItemHAdjustPer/100)) + 'px !important; width:' + (_Width*(_ItemWAdjustPer/100)) + 'px !important; overflow-y:scroll !important;">';
	htmlstrall += '<table style ="border-right: 1px solid #9daab7 !important; border-collapse:collapse !important;"><tbody>';
	htmlstrall += itemhtml;
	htmlstrall += '</tbody></table></div></div>';

	//HTMLへ書き込み
	document.getElementById("ipa_rss_feed_icatw").innerHTML = htmlstrall;

    } catch (e){
	errdisp(_errMsgEX);
    }
}

function errdisp(message){
    var htmlstrall="";

    //画像自動調整有効の場合
    var img_style="";
    if(_ImgAdjustFlg=='1'){
	img_style = 'width:'+ (_Width * (_ImgWAdjustPer/100)) +'px !important; height:'+ (_Height * (_ImgHAdjustPer/100)) +'px !important;';
		}
    //外枠
    htmlstrall += '<div style="height:'+ _Height + 'px !important; width:'+ _Width + 'px !important;' + _divStyleF + '" class="iparssreader_' + _phpPram + '">';
    //画像、ドキュメントタイトル
    htmlstrall += '<table><tbody>';
    htmlstrall += '<tr><td style="width:'+ (_Width * ((100-_ImgWAdjustPer)/100)) +'px !important;">' + _errMsgTitle  + '</td>';
    htmlstrall += '<td style="text-align:center; vertical-align:middle; width:'+ (_Width * (_ImgWAdjustPer/100)) +'px !important; height:'+ (_Height * (_ImgHAdjustPer/100)) +'px !important;' + '">';
    htmlstrall += '<img src="' + _ImgPath + '" style="border-style: none !important; ' + img_style + '"></td></tr>';
    htmlstrall += '</tbody></table>';
    //アイテムテーブル
    htmlstrall += '<div style="padding: 2px !important; border-top: 1px solid #9daab7 !important; height:'+ (_Height*(_ItemHAdjustPer/100)) + 'px !important; width:' + (_Width*(_ItemWAdjustPer/100)) + 'px !important; overflow-y:scroll !important;">';
    htmlstrall += '<table style ="border-right: 1px solid #9daab7 !important; border-collapse:collapse !important;"><tbody>';
    htmlstrall += htmlentities(message);
    htmlstrall += '</tbody></table></div>';

    //HTMLへ書き込み
    document.getElementById("ipa_rss_feed_icatw" ).innerHTML = htmlstrall;
}

function htmlentities(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, '&#39;');
}

function chkURL(str) {
    if(_urlChk=='0') return true;
    
    if (str.match(/^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/)) {
	return true;
    } else {
	return false;
    }
}

