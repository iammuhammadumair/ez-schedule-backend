/*
 Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
(function(){CKEDITOR.plugins.add("uploadimage",{requires:"uploadwidget",onLoad:function(){CKEDITOR.addCss(".cke_upload_uploading img{opacity: 0.3}")},init:function(d){if(CKEDITOR.plugins.clipboard.isFileApiSupported){var f=CKEDITOR.fileTools,h=f.getUploadUrl(d.config,"image");h?(f.addUploadWidget(d,"uploadimage",{supportedTypes:/image\/(jpeg|png|gif|bmp)/,uploadUrl:h,fileToElement:function(){var a=new CKEDITOR.dom.element("img");a.setAttribute("src",k);return a},parts:{img:"img"},onUploading:function(a){this.parts.img.setAttribute("src",
a.data)},onUploaded:function(a){this.replaceWith('\x3cimg src\x3d"'+a.url+'" width\x3d"'+this.parts.img.$.naturalWidth+'" height\x3d"'+this.parts.img.$.naturalHeight+'"\x3e')}}),d.on("paste",function(a){if(a.data.dataValue.match(/<img[\s\S]+data:/i)){a=a.data;var c=document.implementation.createHTMLDocument(""),c=new CKEDITOR.dom.element(c.body),l,b,g;c.data("cke-editable",1);c.appendHtml(a.dataValue);l=c.find("img");for(g=0;g<l.count();g++){b=l.getItem(g);var e=b.getAttribute("src")&&"data:"==b.getAttribute("src").substring(0,
5),k=null===b.data("cke-realelement");e&&k&&!b.data("cke-upload-id")&&!b.isReadOnly(1)&&(e=d.uploadRepository.create(b.getAttribute("src")),e.upload(h),f.markElement(b,"uploadimage",e.id),f.bindNotifications(d,e))}a.dataValue=c.getHtml()}})):CKEDITOR.error("uploadimage-config")}}});var k="data:image/gif;base64,R0lGODlhDgAOAIAAAAAAAP///yH5BAAAAAAALAAAAAAOAA4AAAIMhI+py+0Po5y02qsKADs\x3d"})();