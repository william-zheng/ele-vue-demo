//全局变量
//是否在连接状态
var isLoading = false;
var divLoading;
var frameid = "";

var g_labelElement;
var g_target;

var iFrameJsonObj = '[]';
//var iFrameJsonarray = eval('('+iFrameJsonObj+')');
var iFrameJsonarray = JSON.parse(iFrameJsonObj);
var ELEMENT_HOVER_OUTLINE_STYLE = "2px solid #f00";


//input 的标签集合
var labelArr = ["label", "h1", "h2", "h3", "h4", "h5", "TH"];

function InitLoading() {
    divLoading = document.createElement("div");
    divLoading.id = 'uirecorder-loading';
    divLoading.innerHTML = '<style>#uirecorder-loading{display:none;position:fixed;z-index:2147483647;left:0;top:0;width:100%;height:100%;}#uirecorder-loading div{z-index:0;background:#000;width:100%;height:100%;opacity:0.6}#uirecorder-loading span{z-index:1;position:fixed;top:50%;left:50%;margin-left:-80px;margin-top:-20px;color:white;font-size:30px;}</style><div></div><span>' + 'Loading.....' + '</span>';
    document.body.appendChild(divLoading);
}

function showLoading() {
    if (divLoading) {
        divLoading.style.display = 'block';
    }
}

function hideLoading() {
    if (divLoading) {
        divLoading.style.display = 'none';
    }
}

//InitLoading();





function init_ws() {
    //if ("https:" == location.protocol) {
    //	ws = new WebSocket("wss://localhost:9443/title="+document.title);
    //} else {	
    ws = new WebSocket("ws://localhost:9090/title=" + document.title);
    //}
    ws.onopen = function (e) {

        clearTimeout(t);
        t = 0;
        console.log("connect success");
    };
    ws.onerror = function (e) {
        connect = false;
        console.log("connect error");
        t = setTimeout(init_ws, 500);
    };
    ws.onmessage = function (event) {
        //var xmlObj = new DOMParser();
        //var jsonObj = $.parseJSON(event.data);
        //ws.send("" + run(xmlObj.parseFromString(jsonObj.obj, "text/xml"), jsonObj.action, jsonObj.value));
        //	console.log("===========" + event.data);
        //先获取LABLE的集合
        g_labelElement = getSpecifyTagElement(labelArr);


        var jsonObj = $.parseJSON(event.data);
        if ('all' === jsonObj.type) {
            if (window === top) {
                scanCase(jsonObj.tagArr);

                console.log("scan over .............");
                ws.send('scanEnd');
            }
        }
        else if ("nav" === jsonObj.type) {

            if (window == top) {


                var ULElements = document.body.getElementsByTagName("UL");
                //var navElement = ULElements[0];
                for (var i = 0; i < ULElements.length; i++) {
                    var liElements = ULElements[i].getElementsByTagName("li");
                    for (var index = 0; index < liElements.length; index++) {
                        var aElements = liElements[index].getElementsByTagName("A");
                        for (var hrefIndex = 0; hrefIndex < aElements.length; hrefIndex++) {
                            var textName = aElements[hrefIndex].innerText;

                            var textNameNew = "";

                            textNameNew = textName.replace(/\"/g, "-");

                            var aHref = $(aElements[hrefIndex]).attr("href");

                            if ("" === textNameNew || " " === textNameNew || undefined === aHref || "javascript:void(0);" === aHref)
                                continue;
                            var textAndHref = "{\"text\":\"" + textNameNew + "\",\"href\":\"" + aHref + "\"}";
                            ws.send(textAndHref);
                        }

                    }
                }



                ws.send('scanEnd');

            }

        }


    };
}


var tagname = ["a", "input", "button", "textarea", "select", "div", "span", "p", "label", "datalist", "img", "ul", "ol", "li", "dl", "dt", "menu", "menuitem", "table", "caption", "th", "tr", "td", "tbody", "col", "strong"];



function SetFrameEvent() {
    var documentFrames = window.frames;

    console.log("Set Event Frame Size :" + documentFrames.length);


    for (var frameIndex = 0; frameIndex < documentFrames.length; ++frameIndex) {
        documentFrames[frameIndex].document.body.addEventListener("mousedown", function (event) {

            console.log("Mouse Down Event :" + frameIndex);
            var target = event.target;
            var x = parseInt(target.style.left);
            var y = parseInt(target.style.top);

            if (isNaN(x)) {
                x = 0;
            }
            if (isNaN(y)) {
                y = 0;
            }

            if (x === 0 && y === 0) {
                doMouseDown(target);
            } else {

                doDragElement(target, x, y);
            }

        }, false);

    }

}





function scanCase(jsonObj) {

    for (var tagIndex = 0; tagIndex < jsonObj.length; tagIndex++) {

        var elements = document.body.getElementsByTagName(jsonObj[tagIndex]);

        console.log(elements.length);

        for (var i = elements.length - 1; i >= 0; i--) {
            try {
                var actionCmd = findElementAction(elements[i]);
                if ($(elements[i]).css("display") === 'none') {
                    console.log("元素不可见。。。。。" + elements[i].innerText)
                } else {


                    sendDataToServer(elements[i], actionCmd);
                }

            } catch (err) {
                continue;
            }

        }

        var scanFrames = window.frames;
        for (var index = 0; index < scanFrames.length; index++) {
            try {
                for (var tagIndex1 = 0; tagIndex1 < jsonObj.length; tagIndex1++) {
                    var frame_elements = scanFrames[index].document.body.getElementsByTagName(jsonObj[tagIndex1]);
                    for (var j = 0; j < frame_elements.length; j++) {
                        var frame_actionCmd = findElementAction(frame_elements[j]);
                        frameid = scanFrameId(scanFrames[index]);
                        if ($(frame_elements[j]).css("display") === 'none') {
                            console.log("元素不可见。。。。。" + frame_elements[j].innerText);
                        } else {
                            sendDataToServer(frame_elements[j], frame_actionCmd);
                        }

                    }


                }

            } catch (err) {
                continue;
            }


        }
    }
}


function getSpecifyTagElement(tagArr) {

    var eleMentArr = new Array();

    for (var tagIndex = 0; tagIndex < tagArr.length; tagIndex++) {


        var elements = document.body.getElementsByTagName(tagArr[tagIndex]);

        console.log(elements.length);

        for (var i = elements.length - 1; i >= 0; i--) {
            var actionCmd = findElementAction(elements[i]);
            eleMentArr.push(elements[i]);
        }

        var scanFrames = window.frames;
        for (var index = 0; index < scanFrames.length; index++) {
            try {
                for (var tagIndex1 = 0; tagIndex1 < tagArr.length; tagIndex1++) {
                    var frame_elements = scanFrames[index].document.body.getElementsByTagName(tagArr[tagIndex1]);
                    for (var j = 0; j < frame_elements.length; j++) {
                        var frame_actionCmd = findElementAction(frame_elements[j]);
                        frameid = scanFrameId(scanFrames[index]);
                        eleMentArr.push(frame_elements[j]);
                    }


                }

            } catch (err) {
                continue;
            }


        }
    }

    return eleMentArr;
}



function scanFrameId(frameWindow) {
    //document.domain = getMainHost();
    var id = "";
    try {

        var iframes = window.frames;
        for (var i = 0; i < iframes.length; i++) {
            if (iframes[i] === frameWindow) {

                id = id + "index:" + i + "," + "id:" + iframes[i].frameElement.id + "," + "name:" + iframes[i].frameElement.name;
            } else {
                id = id + "";
            }
        }
    } catch (err) {

        document.domain = getMainHost();
        var iframes = window.parent.frames;
        for (var i = 0; i < iframes.length; i++) {
            if (iframes[i] === window) {
                id = id + i + ",";
            } else {
                id = id + "";
            }
        }

    }

    return id;
}

function findElementAction(target) {
    var actionCmd;
    var ischeck;

    if ('INPUT' === target.tagName) {
        switch (target.type) {
            case 'password':
            case 'file':
            case 'tel':
            case 'text':
            case 'data':
            case 'email':
            case 'search':
            case 'url':
            case 'number':
            case 'range':
                actionCmd =
                    "<Command name=\"setValue\" type=\"action\">" +
                    "<Parameter type=\"element\"/>" +
                    "<Parameter type=\"string\">" + target.value + "</Parameter>" +
                    "</Command>" +
                    "</ElementCommand>";
                break;
            case 'radio':
            case 'checkbox':
                ischeck = target.checked;
                if (ischeck) {
                    ischeck = "false";
                } else {
                    ischeck = "true";
                }
                actionCmd = "<Command name=\"setState\" type=\"action\">" +
                    "<Parameter type=\"element\"/>" +
                    "<Parameter type=\"string\">" + ischeck + "</Parameter>" +
                    "</Command>" +
                    "</ElementCommand>";
            default:
                actionCmd = "<Command name=\"clickControl\" type=\"action\">" +
                    "<Parameter type=\"element\"/>" +
                    "</Command>" +
                    "</ElementCommand>";
                break;
        }
    }
    else if ('SELECT' === target.tagName) {
        // var index = target.selectedIndex;
        // var selectText = target.options[index].text;
        var selectText = "String";
        actionCmd = "<Command name=\"select\" type=\"action\">" +
            "<Parameter type=\"element\"/>" +
            "<Parameter type=\"string\">" + selectText + "</Parameter>" +
            "</Command>" +
            "</ElementCommand>";
    }
    else {
        actionCmd = "<Command name=\"clickControl\" type=\"action\">" +
            "<Parameter type=\"element\"/>" +
            "</Command>" +
            "</ElementCommand>";
    }
    return actionCmd;
}

function find_obj(json) {
    if ("" != json.id.value) {
        var dom_obj = document.getElementById(json.id.value);
        if (compare_obj(dom_obj, json)) {
            return dom_obj;
        } else {
            return null;
        }
    }
    var array_obj = document.getElementsByTagName(json.role.value);
    for (var i = 0; i < array_obj.length; i++) {
        if (compare_obj(array_obj[i], json)) {
            return array_obj[i];
        }
    };
    return null;
}

function findLabel(dom_obj) {
    var rect = dom_obj.getBoundingClientRect();
    var height = $(dom_obj).height();
    var tag = "";
    switch (dom_obj.tagName) {
        case 'INPUT':
        case 'SELECT':

            if ("text" === dom_obj.type || "password" === dom_obj.type || dom_obj.tagName === 'SELECT') {
                //tag = dom_obj.name;
                if ("" != dom_obj.placeholder && dom_obj.tagName === 'INPUT') {
                    tag = dom_obj.placeholder;
                } else {
                    for (var i = 0; i < g_labelElement.length; i++) {
                        var objElement = g_labelElement[i];
                        var objRect = objElement.getBoundingClientRect();
                        //两者中间点进行比较
                        var x_objElement = parseInt(objRect.left);
                        var x_edit = parseInt(rect.left);



                        var y_objElement = parseInt(objRect.bottom);
                        var y_edit = parseInt(rect.bottom);

                        var x = x_edit - x_objElement;
                        var y = y_edit - y_objElement;


                        if (parseInt(x) > parseInt(0) && parseInt(x) < parseInt(200)) {
                            if (parseInt(y) > parseInt(-10) && parseInt(y) < parseInt(20)) {
                                console.log("找到了Lable 标签为 ： " + objElement.tagName + "  内容为 ：   " + objElement.innerText);
                                console.log("x差值 " + x + " y 差值 " + y + "元素 :" + objElement.innerText);
                                if (dom_obj.tagName === 'SELECT') {
                                    tag = objElement.innerText + "_下拉框";
                                } else {
                                    tag = objElement.innerText + "_文本框";
                                }
                                console.log("-------------------------------");
                                break;
                            }

                        }

                    }

                }


            } else if ("submit" === dom_obj.type || "reset" === dom_obj.type || "button" === dom_obj.type) {
                tag = dom_obj.value + "_按钮";
            }

            //form 表单加标识
            if (tag === "" && dom_obj.tagName === 'INPUT') {
                var homepath = getHomePath(dom_obj);
                if (homepath.indexOf("form") > 0) {
                    var formArr = ["input"];
                    var formElements = getSpecifyTagElement(formArr);

                    console.log("寻找input 的个数 :" + formElements.length);

                    for (var index = 0; index < formElements.length; index++) {
                        var formElement = formElements[index];
                        var rectForm = formElement.getBoundingClientRect();

                        var x = parseInt(rectForm.right) - parseInt(rectForm.right);
                        var y = parseInt(rectForm.bottom) - parseInt(rect.bottom);

                        console.log(formElement.value);

                        //	console.log("坐标差值 x: " + x + "坐标差值 : y" + y);

                        if (formElement.type === "submit") {
                            if (y < 10 && y > -10) {
                                console.log("找到表单Input 的标识 ...." + formElement.value);
                                tag = formElement.value + "_文本框";
                                break;
                            }

                        }
                    }
                }
            }

            break;
        case 'TABLE':
        case 'BODY':
        case 'SCRIPT':
        case 'TBODY':
        case 'DIV':
        case 'STYLE':
        case 'FORM':
        case 'UL':
            tag = dom_obj.name;
            break;
        case 'A':
            tag = dom_obj.text;
            break;
        default:
            tag = dom_obj.innerText;
            break;
    }

    if (tag == "") {
        tag = dom_obj.id;
    }

    tag = $.trim(tag).replace(/\s/g, "");
    return tag;

}



function get_json_obj(dom_obj) {
    var rect = dom_obj.getBoundingClientRect();
    var obj = {
        width: $(dom_obj).width(),
        height: $(dom_obj).height(),
        location: { y: parseInt(rect.top), x: parseInt(rect.left) },
        position: { y: $(dom_obj).position().top, x: $(dom_obj).position().left },
        href: $(dom_obj).attr("href"),
        class: $(dom_obj).attr("class"),
        id: dom_obj.id,
        name: $(dom_obj).attr("name"),
        value: dom_obj.value,
        tagName: dom_obj.tagName,
        linkText: dom_obj.text,
        category: "WEBCONTROL",
        title: $(dom_obj).attr("title"),
        type: dom_obj.type,
        tag: "",
        readOnly: $(dom_obj).attr("readOnly"),
    };

    obj.tag = findLabel(dom_obj);
    var pro;
    for (pro in obj) {
        if (undefined == obj[pro]) {
            obj[pro] = "";
        }
    }
    if (("A" == obj.role || "a" == obj.role) && "" == obj.value) {
        obj.value = dom_obj.innerText;
    }
    if (("A" == obj.role || "a" == obj.role) && "" == obj.name) {
        obj.name = dom_obj.innerText;
    }
    return obj;
}

function _abs(a, b) {
    return a > b ? a - b : b - a;
}


function compare_obj(obj, json) {
    var json_obj = get_json_obj(obj);
    var weight = 0;
    if (json.category.value != json_obj.category) {
        weight += parseInt(json.category.weight);
    }
    if (json.class.value != json_obj.class) {
        weight += parseInt(json.class.weight);
    }
    if (json.doc.value != json_obj.doc) {
        weight += parseInt(json.doc.weight);
    }
    if (json.height.value != json_obj.height) {
        weight += parseInt(json.height.weight);
    }
    if (json.width.value != json_obj.width) {
        weight += parseInt(json.width.weight);
    }
    if (json.href.value != json_obj.href) {
        weight += parseInt(json.href.weight);
    }
    if (json.id.value != json_obj.id) {
        weight += parseInt(json.id.weight);
    }
    if (json.name.value != json_obj.name) {
        weight += parseInt(json.name.weight);
    }
    if (json.title.value != json_obj.title) {
        weight += parseInt(json.title.weight);
    }
    if (json.role.value != json_obj.role) {
        weight += parseInt(json.role.weight);
    }
    if (json.value.value != json_obj.value) {
        weight += parseInt(json.value.weight);
    }
    var pos = json.position.value.indexOf(",");
    var position = {};
    position.x = parseInt(json.position.value);
    position.y = parseInt(json.position.value.substring(pos));

    if (_abs(position.x, json_obj.position.x) > 5 || _abs(position.y, json_obj.position.y) > 5) {
        weight += parseInt(json.position.weight);
    }

    pos = json.location.value.indexOf(",");
    var location = {};
    location.x = parseInt(json.location.value);
    location.y = parseInt(json.location.value.substring(pos));

    if (_abs(location.x, json_obj.location.x) > 5 || _abs(location.y, json_obj.location.y) > 5) {
        weight += parseInt(json.location.weight);
    }
    if (weight >= 100) {
        return false;
    } else {
        return true;
    }
}

function clickControl(obj, value) {
    obj.click();
    return 0;
}

function setValue(obj, value) {
    $(obj).val(value);
    return 0;
}

function selectValue(obj, value) {
    $(obj).val(value);
    return 0;
}

function run(obj, action, value) {
    var element = "";
    var elements = obj.childNodes[0].childNodes[0];
    for (var i = 0; i < elements.childElementCount; i++) {
        var ele = elements.childNodes[i];
        var key = ele.attributes["key"].nodeValue;
        var weight = ele.attributes["weight"].nodeValue;
        var v = ele.textContent;
        element += "\"" + key + "\":{\"weight\":\"" + weight + "\",\"value\":\"" + v + "\"},";
    }
    element = element.substring(0, element.length - 1);
    element = "{" + element + "}";
    var json = $.parseJSON(element);
    var dom_obj = find_obj(json);
    if (null != dom_obj) {
        if ("setValue" == action) {
            return setValue(dom_obj, value);
        } else if ("clickControl" == action) {
            return clickControl(dom_obj, value);
        } else if ("select" == action) {
            return selectValue(dom_obj, value);
        } else if ("getProperty" == action) {
            var xml = "<?xml version=\"1.0\"?>" +
                "<ElementCommand>" +
                "<Element fullNameFormat=\"role,name\">" +
                "<Property key=\"category\" weight=\"100\">WEBCONTROL</Property>" +
                "<Property key=\"class\" weight=\"100\">search</Property>" +
                "<Property key=\"doc\" weight=\"100\">CSDN.NET - sdsada</Property>" +
                "<Property key=\"height\" weight=\"100\">14</Property>" +
                "<Property key=\"href\" weight=\"0\"/>" +
                "<Property key=\"id\" weight=\"100\">srch1</Property>" +
                "<Property key=\"location\" weight=\"0\">5655,5</Property>" +
                "<Property key=\"name\" weight=\"100\">passwordtwo</Property>" +
                "<Property key=\"position\" weight=\"100\">1445.5,3</Property>" +
                "<Property key=\"role\" weight=\"100\">INPUT</Property>" +
                "<Property key=\"title\" weight=\"0\"/>" +
                "<Property key=\"value\" weight=\"0\">搜索</Property>" +
                "<Property key=\"width\" weight=\"100\">170</Property>" +
                "</Element>" +
                "</ElementCommand>";
            return xml;
        } else {
            return -1;
        }
    } else {
        return -2;
    }
}

//获取xpath


function onEvent() {
    if (window.event.ctrlKey && window.event.altKey) {
        var obj = get_json_obj(this);
        var rect = this.getBoundingClientRect();
        var xpath = readXPath(this);
        console.log(xpath);
        var xml = "<Element fullNameFormat=\"role,name\">" +
            "<Property key=\"category\" weight=\"100\"><![CDATA[" + obj.category + "]]></Property>" +
            "<Property key=\"role\" weight=\"100\"><![CDATA[" + obj.role + "]]></Property>" +
            "<Property key=\"id\" weight=\"100\"><![CDATA[" + obj.id + "]]></Property>" +
            "<Property key=\"name\" weight=\"100\"><![CDATA[" + obj.name + "]]></Property>" +
            "<Property key=\"class\" weight=\"100\"><![CDATA[" + obj.class + "]]></Property>" +
            "<Property key=\"href\" weight=\"0\"><![CDATA[" + obj.href + "]]></Property>" +
            "<Property key=\"value\" weight=\"0\"><![CDATA[" + obj.value + "]]></Property>" +
            "<Property key=\"title\" weight=\"0\"><![CDATA[" + obj.title + "]]></Property>" +
            "<Property key=\"location\" weight=\"0\"><![CDATA[" + obj.location.x + "," + obj.location.y + "]]></Property>" +
            "<Property key=\"position\" weight=\"100\"><![CDATA[" + obj.position.x + "," + obj.position.y + "]]></Property>" +
            "<Property key=\"width\" weight=\"100\"><![CDATA[" + obj.width + "]]></Property>" +
            "<Property key=\"height\" weight=\"100\"><![CDATA[" + obj.height + "]]></Property>" +
            "<Property key=\"doc\" weight=\"100\"><![CDATA[" + obj.doc + "]]></Property>" +
            "</Element>" +
            "<Command name=\"//\" type=\"comment\">" +
            "<Parameter type=\"string\">record element:</Parameter>" +
            "<Parameter type=\"element\"></Parameter>" +
            "</Command>" +
            "</ElementCommand>\0" + parseInt(rect.top) + "," + parseInt(rect.left) + "," + parseInt(rect.right) + "," + parseInt(rect.bottom);
        if (ws.readyState == 1) {
            //ws.send(xml);
        }
    }
}


var ws = null;
var t = setTimeout(init_ws, 500);
console.log("加载完毕");

// document.body.addEventListener("DOMSubtreeModified", function(){
// 	for (var i = 0; i < tagname.length; i++) {
// 		$(tagname[i]).off("mouseover");
// 		$(tagname[i]).on("mouseover", onEvent);
// 	};
// }, false);

// for (var i = 0; i < tagname.length; i++) {
// 	$(tagname[i]).on("mouseover", onEvent);
// };






function actionInput(target) {
    var xml;
    var ischeck;


    switch (target.type) {
        case "checkbox":
        case "radio":
            ischeck = target.checked;
            if (ischeck) {
                ischeck = "false";
            } else {
                ischeck = "true";
            }
            xml = "<Command name=\"setState\" type=\"action\">" +
                "<Parameter type=\"element\"/>" +
                "<Parameter type=\"string\">" + ischeck + "</Parameter>" +
                "</Command>" +
                "</ElementCommand>";
            break;
        case "password":
            xml = "NONE";
            break;
        default:
            xml = "<Command name=\"clickControl\" type=\"action\">" +
                "<Parameter type=\"element\"/>" +
                "</Command>" +
                "</ElementCommand>";
            break;
    }


    return xml;

}



//href
function sendDataToServer(target, xmlAction) {

    var obj = get_json_obj(target);
    var xpath = readXPath(target);


    var innerText = "";
    //var linkText = "";
    //针对获取target 解决相同标题的问题	
    var blank = "";
    if (target.tagName === "A") {
        blank = target.target;
        //linkText = obj.linkText;
    } else if (target.tagName === "IMG") {
        var parentNode = target.parentNode;
        if (parentNode.tagName === "A") {
            blank = parentNode.target;
        }
    }
    if (blank === undefined) {
        blank = "";
    }
    //readOnly 

    var text_weight = "\"0\"";
    //对不同的对象配置不同的属性权重
    if (target.tagName === "INPUT" || target.tagName === "SPAN" || target.tagName === "A" || target.tagName === "BUTTON") {
        text_weight = "\"100\"";
    } else {
        text_weight = "\"0\"";
    }
    var url = window.location.href;


    iFrameJsonObj = '[]';
    iFrameJsonarray = eval('(' + iFrameJsonObj + ')');
    frameid = getIFramid(window);
    if (frameid === undefined) {
        frameid = "";
    }


    var title = document.title;
    var head = "";
    try {
        head = window.top.document.head.innerHTML;
    } catch (err) {
        head = "";
    }


    if (title === "") {
        try {
            title = window.parent.document.title;
            if (title === '') {
                title = "无标题窗口"
            }
        } catch (err) {

            title = "外域窗口"
        }

    }
    var homepath = getHomePath(target);
    var xmlAbove = "<?xml version=\"1.0\"?>" +
        "<ElementCommand>" +
        "<Element fullNameFormat=\"winClass\">" +
        "<Property key=\"category\" weight=\"100\">WINCONTROL</Property>" +
        "<Property key=\"winClass\" weight=\"100\"><![CDATA[" + title + "]]></Property>" +
        "</Element>" +
        "<Command name=\"browser\" type=\"action\">" +
        "<Parameter type=\"element\"/>" +
        "</Command>" +
        "<Element fullNameFormat=\"tagName,tag\">" +
        "<Property key=\"category\" weight=\"100\">CHROMECONTROL</Property>" +
        "<Property key=\"href\" weight=\"0\"><![CDATA[" + obj.href + "]]></Property>" +
        "<Property key=\"iframeId\" weight=\"100\"><![CDATA[" + frameid + "]]></Property>" +
        "<Property key=\"homepath\" weight=\"100\"><![CDATA[" + homepath + "]]></Property>" +
        "<Property key=\"id\" weight=\"100\"><![CDATA[" + obj.id + "]]></Property>" +
        "<Property key=\"name\" weight=\"100\"><![CDATA[" + obj.name + "]]></Property>" +
        "<Property key=\"class\" weight=\"100\"><![CDATA[" + obj.class + "]]></Property>" +
        "<Property key=\"tagName\" weight=\"100\"><![CDATA[" + obj.tagName + "]]></Property>" +
        "<Property key=\"value\" weight=\"0\"><![CDATA[" + obj.value + "]]></Property>" +
        "<Property key=\"type\" weight=\"0\"><![CDATA[" + obj.type + "]]></Property>" +
        "<Property key=\"location\" weight=\"0\"><![CDATA[" + obj.location.x + "," + obj.location.y + "]]></Property>" +
        "<Property key=\"width\" weight=\"0\"><![CDATA[" + obj.width + "]]></Property>" +
        "<Property key=\"height\" weight=\"0\"><![CDATA[" + obj.height + "]]></Property>" +
        "<Property key=\"innerText\" weight=" + text_weight + "><![CDATA[" + obj.linkText + "]]></Property>" +
        "<Property key=\"xPath\" weight=\"100\"><![CDATA[" + xpath + "]]></Property>" +
        "<Property key=\"tag\" weight=\"0\"><![CDATA[" + obj.tag + "]]></Property>" +
        "<Property key=\"blank\" weight=\"0\"><![CDATA[" + blank + "]]></Property>" +
        "<Property key=\"readOnly\" weight=\"100\"><![CDATA[" + obj.readOnly + "]]></Property>" +
        "</Element>";


    var xml = xmlAbove + xmlAction;
    if (ws.readyState == 1) {

        if (xmlAction == "NONE" || xmlAction === undefined) {
            //
        } else {
            ws.send(xml);
            //console.log(xml);
        }
    }
}

function doDragElement(target, x, y) {

    var xml = "<Command name=\"dragControl\" type=\"action\">" +
        "<Parameter type=\"element\"/>" +
        "<Parameter type=\"numeral\">" + x + "</Parameter>" +
        "<Parameter type=\"numeral\">" + y + "</Parameter>" +
        "</Command>" +
        "</ElementCommand>";
    sendDataToServer(target, xml);
}


function doMouseDown(target) {

    var xml;
    switch (target.tagName) {
        case "INPUT":
            xml = actionInput(target);
            break;
        case "BUTTON":
            xml = actionInput(target);
            break;
        case "SELECT":
            xml = "NONE";
            break;
        default:
            xml = actionInput(target);
            break;

    }

    //target.style.backgroundColor = 'red';

    g_target = target;
    sendDataToServer(target, xml);
    ///target.style.backgroundColor = '';

}

function doKeyInout(target) {
    var xml;
    if (target.tagName == "SELECT") {
        xml = "NONE";

    } else if (target.type === "radio" || target.type === "checkbox") {

        //xml = actionInput(target);
    } else if (target.tagName === "INPUT") {
        switch (target.type) {

            case "text":
            case "password":
                xml = "<Command name=\"setValue\" type=\"action\">" +
                    "<Parameter type=\"element\"/>" +
                    "<Parameter type=\"string\">" + target.value + "</Parameter>" +
                    "</Command>" +
                    "</ElementCommand>";
                break;
            default:
                xml = "NONE";
                break;
        }

    } else {
        xml = "NONE";
    }

    sendDataToServer(target, xml);
}

function doSelect(target) {

    var index = target.selectedIndex;
    var selectText = target.options[index].text;

    xml = "<Command name=\"select\" type=\"action\">" +
        "<Parameter type=\"element\"/>" +
        "<Parameter type=\"string\">" + selectText + "</Parameter>" +
        "</Command>" +
        "</ElementCommand>";
    sendDataToServer(target, xml);
}

//dom 事件 包括鼠标移入，鼠标点击，键盘输入,中文输入结束，下拉框发生改变
//	"<Parameter type=\"element\"></Parameter>"+
document.body.addEventListener("mouseout", function (event) {
    if (this.rec_hoverElement == event.target) {
        try {
            // this.rec_clearHoverElement();
            if (!this.rec_hoverElement) {
                return;
            }
            this.rec_hoverElement.style.outline = '';
            this.rec_hoverElement = null;
        } catch (e) {
            // Fail silently 
            console.log("Hover handling fail: " + e);
        }
    }
}, true);


document.body.addEventListener("mouseover", function (event) {

    var target = event.target;

    if (event.target != this.rec_hoverElement) {
        try {
            this.rec_hoverElement = event.target;
            this.rec_hoverElement.style.outline = ELEMENT_HOVER_OUTLINE_STYLE;
        } catch (e) {
            // Fail silently
            console.log("Hover handling fail: " + e);
        }
    }


    //表格控件
    if (window.event.ctrlKey || window.event.altKey) {
        // $(target).hover(function(){
        // if(target.tagName !== 'DIV'){$(target).css("background-color","yellow");}					
        // },function(){
        //  				 if(target.tagName !== 'DIV'){
        // 			$(target).css("background-color","");
        // 		}
        // });
        // console.log(target.tagName);
        if ("TD" == target.tagName) {
            var parent = target.parentNode;
            var grandFather = parent.parentNode;
            var xml = "<Command name=\"//\" type=\"comment\">" +
                "<Parameter type=\"string\">record element:</Parameter>" +
                "<Parameter type=\"element\"></Parameter>" +
                "</Command>" +
                "</ElementCommand>";
            sendDataToServer(grandFather, xml);
        } else {
            var xml = "<Command name=\"//\" type=\"comment\">" +
                "<Parameter type=\"string\">record element:</Parameter>" +
                "<Parameter type=\"element\"></Parameter>" +
                "</Command>" +
                "</ElementCommand>";
            sendDataToServer(target, xml);

        }
    }

    //sendDataToServer(target,xml);
}, true);



document.addEventListener("mousedown", function (event) {
    console.log("mousedown event .....");
    var target = event.target;

    g_labelElement = getSpecifyTagElement(labelArr);
    //console.log(getFrameId());
    //console.log(getIFramid(window));
}, true);

document.addEventListener("mouseup", function (event) {
    var target = event.target;
    if (target.tagName === 'HTML')
        return;
    g_labelElement = getSpecifyTagElement(labelArr);
    var x = parseInt(target.style.left);
    var y = parseInt(target.style.top);

    if (isNaN(x)) {
        x = 0;
    }
    if (isNaN(y)) {
        y = 0;
    }

    if (x === 0 && y === 0) {
        doMouseDown(target);
    } else {

        doDragElement(target, x, y);
    }

}, true);

window.onscroll = function () {

    //.log("1111111111111111");
}

document.addEventListener('input', function (event) {
    var target = event.target;
    g_labelElement = getSpecifyTagElement(labelArr);
    doKeyInout(target);
}, true);

//焦点函数 
document.addEventListener('focus', function (event) {

    var target = event.target;
    //   frameid = getIFramid(window);	
    //console.log("::::" + event.data);


}, true);

//失去焦点

document.addEventListener('blur', function (event) {
    var target = event.target;
    //console.log("::::" + event.data);
    //	frameid = getIFramid(window);
    ///doKeyInout(target);
    //console.log(target.onchange);

}, true);

//下拉框事件
document.addEventListener("change", function (event) {
    var target = event.target;
    var g_labelElement = getSpecifyTagElement(labelArr);
    if ("INPUT" === target.tagName) {
    } else {
        doSelect(target);
    }
}, true);




function readXPath(element) {
    if (element.id !== "") {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
        return '//*[@id=\"' + element.id + '\"]';
    }
    //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
    if (element == document.body) {//递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    var ix = 1,//在nodelist中的位置，且每次点击初始化
        siblings = element.parentNode.childNodes;//同级的子元素

    for (var i = 0, l = siblings.length; i < l; i++) {
        var sibling = siblings[i];
        //如果这个元素是siblings数组中的元素，则执行递归操作
        if (sibling == element) {
            return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
            //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
        } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
            ix++;
        }
    }
}

function getHomePath(element) {
    //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
    if (element.id !== "") {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
        //  return '//*[@id=\"' + element.id + '\"]';
    }
    if (element == document.body) {//递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    if (element.parentNode === null) {
        //console.log("==========================" + element.tagName);
        return "";
    }
    var ix = 1,//在nodelist中的位置，且每次点击初始化
        siblings = element.parentNode.childNodes;//同级的子元素

    for (var i = 0, l = siblings.length; i < l; i++) {
        var sibling = siblings[i];
        //如果这个元素是siblings数组中的元素，则执行递归操作
        if (sibling == element) {
            return getHomePath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
            //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
        } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
            ix++;
        }
    }
}

//var id = "";


function getIFramid(window) {
    var id = "";
    try {

        var iframes = window.parent.frames;
        for (var i = 0; i < iframes.length; i++) {
            if (iframes[i] === window) {
                //tag = getIFramid(window.parent) + ',' + i;
                //id = id + "index:" + i +"," + "id:" + iframes[i].frameElement.id + "," + "name:" + iframes[i].frameElement.name;
                var jsonStr = '{"index":' + i + ',' + '"id":"' + iframes[i].frameElement.id + '","name":"' + iframes[i].frameElement.name + '"}';
                iFrameJsonarray.push(jsonStr);
                if (window.parent === window.top) {
                    break;
                } else {
                    getIFramid(window.parent);
                }
            }
        }
    } catch (err) {
        // document.domain = getMainHost();
        // var iframes = window.parent.frames;	
        // for (var i = 0; i < iframes.length; i++) {
        // 	if (iframes[i] === window) {
        // 		//tag = getIFramid(window.parent) + ',' + i;
        // 		id = id + i + ",";
        // 	}else {
        // 		id = id + "";
        // 	}
        // }	
        return id;
    }
    //console.log("........" + id);
    return JSON.stringify(iFrameJsonarray);
}


function getMainHost() {
    let key = `mh_${Math.random()}`;
    let keyR = new RegExp(`(^|;)\\s*${key}=12345`);
    let expiredTime = new Date(0);
    let domain = document.domain;
    let domainList = domain.split('.');

    let urlItems = [];
    // 主域名一定会有两部分组成
    urlItems.unshift(domainList.pop());
    // 慢慢从后往前测试
    while (domainList.length) {
        urlItems.unshift(domainList.pop());
        let mainHost = urlItems.join('.');
        let cookie = `${key}=${12345};domain=.${mainHost}`;

        document.cookie = cookie;

        //如果cookie存在，则说明域名合法
        if (keyR.test(document.cookie)) {
            document.cookie = `${cookie};expires=${expiredTime}`;
            return mainHost;
        }
    }
}

export default ws;
