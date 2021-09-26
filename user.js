// ==UserScript==
// @name         医药大学堂下载助手(Engine:AvA)
// @namespace    https://qinlili.bid
// @version      0.1
// @description  测试性
// @author       琴梨梨
// @match        *://static.bcedocument.com/reader/v2/pc/xreader/xreader.html?*
// @match        *://*/AvA_DL_CORS_PAGE_BCEPDF?*
// @grant        none
// @run-at document-start
// @require https://cdn.jsdelivr.net/npm/jspdf@2.4.0/dist/jspdf.umd.min.js
// ==/UserScript==

(function() {
    'use strict';
    //=====说明=====
    //PPT下载方式：右键PPT会弹出询问

    if(document.location.host=="static.bcedocument.com"){
        console.log("AvA Engine Launching...")
        console.log("BCE Reader Detected!~Meow~");
        var callbackFunc;
        var imgList;
        //insertBefore Hook
        (function(insertBefore) {
            Node.prototype.insertBefore = function(ele,loc) {
                if(ele.src&&ele.src.indexOf("reader?getcontent")>0){
                    console.log("Catch Page Detail~Meow~"+ele.src)
                    ele.src=ele.src.replace("rn=10","rn=9999")
                    var params=ele.src.substr(ele.src.indexOf("?"))
                    var searchParams = new URLSearchParams(params)
                    console.log(searchParams.get("callback"))
                    callbackFunc=searchParams.get("callback");
                    var originCall=window[callbackFunc];
                    window[callbackFunc]=function(calltext){
                        imgList=calltext.data
                        originCall(calltext)
                    }
                }
                insertBefore.call(this, ele,loc);
            };

        })(Node.prototype.insertBefore);

        document.body.oncontextmenu=function(){
            if(confirm("是否下载为PDF？")){
                var url=imgList[0].zoom
                var domain=url.substring(0,url.indexOf("/",url.indexOf("//")+2))
                var dlurl=domain+"/AvA_DL_CORS_PAGE_BCEPDF?"+encodeURIComponent(JSON.stringify(imgList))
                window.open(dlurl, "_blank");

            }
            return false;
        }

    }

    function imgToPDF(list){
        var PDFfile=false;
        var imgEle=document.createElement("img");
        document.body.innerHTML="<H2>正在保存...</H2>"
        document.body.appendChild(imgEle);
        var i=0
        console.log(list)
        function saveNextPic(){
            console.log("Saving " +i+" Image");
            imgEle.onload=function(){
                if(PDFfile){
                }else{
                    var ori
                    if(imgEle.naturalWidth>imgEle.naturalHeight){ori="l"}else{ori="p"}
                    PDFfile=new jsPDF({
                        orientation: ori,
                        unit: 'px',
                        format: [imgEle.naturalWidth,imgEle.naturalHeight],
                        putOnlyUsedFonts:true,
                    });
                }
                toDataURL(list[i].zoom,function(data){
                    PDFfile.addImage(data,"JPEG",0,0,imgEle.naturalWidth,imgEle.naturalHeight,"Slide"+(i+1),"SLOW")
                    if(list[(i+1)]){
                        PDFfile.addPage();
                        i++;
                        saveNextPic();
                    }else{
                        PDFfile.save("BCEDOCDL.pdf")
                    }
                })
            }
            imgEle.src=list[i].zoom;
        }
        saveNextPic();
    }
    function toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }




    //CORS下载_百度云阅读器
    if(document.location.pathname=='/AvA_DL_CORS_PAGE_BCEPDF'){
        console.log("AvAvA AvA~")
        var jsPDF=jspdf.jsPDF
        try{
            console.log(jsPDF)
            console.log("jsPDF Ready!")
        }catch{
            console.error("jsPDF Not Ready!")
        }
        imgToPDF(JSON.parse(decodeURIComponent(document.location.search.substr(1))));
    }
})();
