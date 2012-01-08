/*
ui/jquery.SiteBoxMirror.js

Jquery wrapper for codemirror2
requires 
  jQuery 1.5+
  jquery UI
  CodeMirror2
  
  see public methods and properties for internal dependencies
  
*/

// create closure
(function($){

  /*-------------------------------------------------------------------------------------------*/
  //plugin methods
  /*-------------------------------------------------------------------------------------------*/
  
  var methods = {
    init : function(options){
      //set options
      var opts = $.extend({}, $.fn.SiteBoxMIRROR.mirror, options);
      
      // load libs
      loadLibs();
      

      //iterate over jquery object this
      return this.each(function(i, o) { 

        //validate that we are a textarea
        var tagName = o.tagName;
        if(tagName.toLowerCase() != "textarea"){
          debug($(o).attr("id") + "(" + tagName + ") is not a textarea");
          return false;
        }

        //set up the editor
        initMIRROR(o, opts);

      });//end this.each() 

    },// end init
        
    getCode : function(){
      var code="";
      this.each(function(i, o) {
        var editor =  $(o).data("siteBoxMirror").editor; //$(o).data("editorInstance");
        if(editor){
          //Copy the content of the editor into the textarea
          editor.save();
          //get value for return
          //debug(editor.getValue());
          debug("getCode " + $(o).attr("id"));
          code = code + editor.getValue();
        }
      });//end this.each()
      //concatenated text (if more than one object specified)
      return code;
    },// end getCode

    setCode : function(code){
      return this.each(function(i, o) {
        var editor =  $(o).data("siteBoxMirror").editor; //$(o).data("editorInstance");
        if(editor){
          debug("setCode " + $(o).attr("id"));
          editor.setValue(code);
          //editor.refresh();
          var m = "standard";
          if($(o).data("siteBoxMirror").frame.hasClass("fullscreen")){
             m = "fullscreen";
          }
          setScrollSize($(o).data("siteBoxMirror").frame, m, editor);
        }
      });//end this.each()
    },// end setCode

    destroy : function(){
       return this.each(function(i, o) {
         var editor =  $(o).data("siteBoxMirror").editor; //$(o).data("editorInstance");
         if(editor){
           //Copy the content of the editor into the textarea.
           editor.save();
           //remove ui
           var $thisui = $(o).next();
           $thisui.remove();
           //show labels
           $(o).parent().find("label[for='" + $(o).attr("id") + "']").each(function(i, label){
            $(label).show();
           });
           //remove data
           $(o).removeData("siteBoxMirror");
           
           //show textarea
           $(o).show();
           debug("destroy " + $(o).attr("id"));
         }
      });
    },// end destroy

    highlight : function(options){
      //set options
      var opts = $.extend({}, $.fn.SiteBoxMIRROR.mirror, options);
      // load libs
      loadLibs();
      return this.each(function(i, o) {
        //validate that we are a pre
        var tagName = o.tagName;
        if(tagName.toLowerCase() != "pre"){
          debug($(o).attr("id") + "(" + tagName + ") is not a pre");
          return false;
        }
        debug("highlight pre: " + $(o).attr("id"));
        $(o).addClass("cm-s-default");
        $(o).addClass("siteBoxMirror-highlight");
        CodeMirror.runMode($(o).text(), opts.mode, o);
      });
    }// end highlight

    
  };// end methods

  /*-------------------------------------------------------------------------------------------*/
  //plugin begins
  /*-------------------------------------------------------------------------------------------*/
  $.fn.SiteBoxMIRROR = function(method){
      if ( methods[method] ) {
        return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } 
      else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } 
      else {
        $.error( 'Method ' +  method + ' does not exist on SiteBoxMIRROR' );
      }
  };
  /*-------------------------------------------------------------------------------------------*/
  //plugin ends
  /*-------------------------------------------------------------------------------------------*/

  /*-------------------------------------------------------------------------------------------*/
  //private functions and properties
  /*-------------------------------------------------------------------------------------------*/
  
  // private function for debugging
  function debug(message) {
    if (window.console && window.console.log){
      window.console.log(message);
    }
  }

  function resizeMirrors(){

    $(".siteBoxMirror-frame").each(function(i, frame){
      var $srcObj = $(frame).data("siteBoxMirror").src;
      var e = $(frame).data("siteBoxMirror").src.data("siteBoxMirror").editor;
      var m = "standard";
      if($(frame).hasClass("fullscreen")){
         m = "fullscreen";
      }
      setScrollSize($(frame), m, e);
    });

  }

  function getFileUrl(fileObj){
     var root = "";
     if(fileObj.root == "sb"){
        root = $.fn.SiteBoxMIRROR.configInfo.pluginRoot;
     }
     else{
       root = $.fn.SiteBoxMIRROR.configInfo.codeMirrorRoot;
     }
     return root + fileObj.path;
  }

  //Init 
  function initMIRROR(objToConfig, opts){

    var configObjId = $(objToConfig).attr("id")
    debug("SiteBoxMirror.initMIRROR()" + configObjId);
    
    var $frame = $("<div></div>");
    $frame.attr("class", "siteBoxMirror-frame");
    $frame.attr("id", configObjId + "_ui_frame");
    
    var $uibar = $("<div></div>");
    $uibar.attr("class", "siteBoxMirror-uibar");

    var $buttonbar = $("<div></div>");
    $buttonbar.attr("class", "siteBoxMirror-buttonbar");

    for(var b in $.fn.SiteBoxMIRROR.buttons){

      var $button = $("<img />");
      $button.attr("src", getFileUrl($.fn.SiteBoxMIRROR.buttons[b].icon));
      $button.attr("alt", b);
      $button.attr("title", $.fn.SiteBoxMIRROR.buttons[b].title);
      $button.attr("class", "siteBoxMirror-button");
      var $buttonLink = $("<a></a>");
      $buttonLink.html($button);
      $buttonLink.attr("href", "#" + configObjId + "_ui_frame");
      $buttonbar.append($buttonLink);
    }

    $uibar.append($buttonbar);

    var $titlebar = $("<div>&nbsp;</div>");
    $titlebar.attr("class", "siteBoxMirror-titlebar");

    $(objToConfig).parent().find("label[for='" + $(objToConfig).attr("id") + "']").each(function(i, label){
      $(label).hide();
      $titlebar.text($(label).text());
    });

    $uibar.append($titlebar);

    $frame.append($uibar);

    $clearFloat = $("<div></div>");
    $clearFloat.attr("class", "siteBoxMirror-clearFloat");
    $frame.append($clearFloat);
    
    $frame.insertAfter($(objToConfig));
    
    var ed = CodeMirror.fromTextArea(objToConfig, opts);
    
    $frame.append( $(ed.getWrapperElement()) );
    
    //set up button clicks
    $uibar.find(".siteBoxMirror-button").each(function(i, button){
      $(button).parent().click(function(e){
        //use the function defined in $.fn.SiteBoxMIRROR.buttons.action
        $.fn.SiteBoxMIRROR.buttons[$(button).attr("alt")].action($(button), ed, e);
        //return false;
      });
    });
    
    $(objToConfig).data("siteBoxMirror", {editor : ed, frame : $frame});
    $frame.data("siteBoxMirror", { src : $(objToConfig) });
    ed.refresh();

  }

  //set CodeMirror-scroll size;

  function setScrollSize($frame, mode, editor){

    var $codeMirror = $($frame.find("div.CodeMirror").get(0));
    $codeMirror.hide();

    if(mode == "fullscreen"){
      var $uibar = $($frame.find("div.siteBoxMirror-uibar").get(0));
      $frame.find(".CodeMirror-scroll").each(function(i, obj){
        $(obj).removeAttr("style");
        var width = $(window).width();
        $(obj).width(width);
        $(obj).height($(window).height() - $uibar.height() - 10);
      });
    }
    else{
      
      $frame.find(".CodeMirror-scroll").each(function(i, obj){
        //var width = $frame.parent().width() - 5;
        $(obj).removeAttr("style");
        //$(obj).width(width);
      });
      
    }

    $codeMirror.show();
    editor.refresh();
  }


  //UI Button clicks
  
  //Find
  function mirrorUiFindClick($button, editor, e){
    var w = 440;
    var h = 120;
    var coords = [ $button.offset().left - w, $button.offset().top - $(window).scrollTop() ];
    
    $("#mirrorSearch").dialog({
      title: "search", 
      width: w,
      height: h,
      autoOpen: true,
      resizable: true,
      position : coords,
      open : function(event, ui) {
        $("#mirrorSearch").data("editorInstance", editor);
        var $link = $("#ui-dialog-title-mirrorSearch").next(".ui-dialog-titlebar-close");
        $link.attr("href", "javascript:return false;");
      },
      close : function(){
         CodeMirror.commands.uiClearSearch(editor);
         editor.setSelection(editor.getCursor());
         editor.focus();
         $("#mirrorSearch").removeData("editorInstance");
         return false;
      }
    });
  }

  //IndentSelected
  function mirrorUiIndentSelectedClick($button, editor, e){
    var start = editor.getCursor(true)["line"];
    var end = editor.getCursor(false)["line"];
    for(var line = start; line <= end; line++) {
      editor.indentLine(line);
    }
  }

  //IndentDocument
  function mirrorUiIndentDocumentClick($button, editor, e){
    var lineCount = editor.lineCount();
    for(var line = 0; line < lineCount; line++) {
      editor.indentLine(line);
    }
  }

  //ToggleFullScreen

  function togglePageVisibility(show){

    $("body").children().each(function(i, o){

      if(show){
        $(o).removeClass("siteBoxMirror-hidden");
      }
      else{
        $(o).addClass("siteBoxMirror-hidden");
      }

    });
  }

   
  function mirrorUiToggleFullScreenClick($button, editor, e){
    var $frame = $button.parent().parent().parent().parent();
    if($frame.hasClass("fullscreen")){
      $frame.removeClass("fullscreen");
      togglePageVisibility(true);
      $frame.insertAfter($(editor.getTextArea()));
      setScrollSize($frame, "standard", editor);
    }
    else{
      $frame.addClass("fullscreen");
      togglePageVisibility(false);
      $("body").append($frame);
      setScrollSize($frame, "fullscreen", editor);
    }
    //editor.focus();
  }


  //add required libs to the current document
  var cssLibLoaded = false;
  var jsLibLoaded = false;
  var searchLoaded = false;
  var resizeSet = false;
  var loadComplete = false;

  function loadLibs(){

    if(loadComplete) return;

   //css
    if(!cssLibLoaded){
      lazyLoadCss();
      cssLibLoaded = true;
    }
    //js
    if(!jsLibLoaded){
      lazyLoadJs();
      jsLibLoaded = true;
    }
    //search dialoug
    if(!searchLoaded){
      $.ajax({
        type : "POST",
        url : getFileUrl($.fn.SiteBoxMIRROR.configInfo.pluginSearchUrl),
        success: function(responseText, statusText){
         $("body").append(responseText);
        },
        dataType: "html"
      });
      searchLoaded = true;
    }

    if(!resizeSet){
      $(window).bind("resize", resizeMirrors);
      resizeSet = true;
    }

    loadComplete = true;
    
  }


  function lazyLoadJs(){
    if(typeof window.CodeMirror != "undefined") {
      debug("codemirror detected autoload cancelled");
      return; 
    }
    //js (from the cache if possible)
    jQuery.ajaxSetup( { cache : true } );
    for(var s in $.fn.SiteBoxMIRROR.jsLib){
      var url = getFileUrl($.fn.SiteBoxMIRROR.jsLib[s]);
      $("head").append("<script type='text/javascript' src='" + url + "'></script>");
      debug("Script " + url + " appended to document head");
    }
  }


  function lazyLoadCss(){
    //css
    for(var s in $.fn.SiteBoxMIRROR.cssLib){
      var url = getFileUrl($.fn.SiteBoxMIRROR.cssLib[s]);
      if($("link[href='" + url + "']").length == 0){
        $("head").append("<link type='text/css' title='" + s + "' rel='stylesheet' href='" + url + "'/>");
        debug("Style " + url + " appended to document head");
      }
      else{
        debug("Style " + url + " already in document");
      }
    }
  }
  
  /*-------------------------------------------------------------------------------------------*/
  // define and expose public methods and properties
  /*-------------------------------------------------------------------------------------------*/
  //config methods
  $.fn.SiteBoxMIRROR.SetConfig = function(opts){

    if(opts.mirror){
      $.extend($.fn.SiteBoxMIRROR.mirror, opts.mirror);
    }

    if(opts.configInfo){
      $.extend($.fn.SiteBoxMIRROR.configInfo, opts.configInfo);
    }
    
    if(opts.cssLib){
      $.extend($.fn.SiteBoxMIRROR.cssLib, opts.cssLib);
    }

    if(opts.jsLib){
      $.extend($.fn.SiteBoxMIRROR.jsLib, opts.jsLib);
    }

    if(opts.modes){
      $.extend($.fn.SiteBoxMIRROR.modes, opts.modes);
    }

    if(opts.buttons){
      $.extend($.fn.SiteBoxMIRROR.buttons, opts.buttons);
    }
  }

  $.fn.SiteBoxMIRROR.GetConfig = function(format){

    var opts = {
      mirror     : $.fn.SiteBoxMIRROR.mirror,
      configInfo : $.fn.SiteBoxMIRROR.configInfo,
      cssLib     : $.fn.SiteBoxMIRROR.cssLib,
      jsLib      : $.fn.SiteBoxMIRROR.jsLib,
      modes      : $.fn.SiteBoxMIRROR.modes,
      buttons    : $.fn.SiteBoxMIRROR.buttons
    };
    
    if(format.toLowerCase() == "json"){
      try{
         return JSON.stringify(opts, null, 2);
      }
      catch(e){
         return opts;
      }
    }
    else{
      return opts;
    }
  }

  $.fn.SiteBoxMIRROR.GetSourceList = function(){

    var list =  getFileUrl( $.fn.SiteBoxMIRROR.configInfo.pluginFileName);
    for(var key in $.fn.SiteBoxMIRROR.jsLib){
      list += "," + getFileUrl($.fn.SiteBoxMIRROR.jsLib[key]);
    }
    return list;

  }


  // plugin defaults
  $.fn.SiteBoxMIRROR.mirror = {
    mode        : "text/html",
    tabSize     : 2, 
    lineNumbers : true
  };

  $.fn.SiteBoxMIRROR.configInfo = {                  
    codeMirrorRoot  : "/CodeMirror2/",               //alias to root : cm
    pluginRoot      : "/CodeMirror2/SiteBoxMirror/", //alias to root : sb
    pluginFileName  : { root: "sb", path : "jquery.SiteBoxMirror.js" },
    pluginSearchUrl : { root: "sb", path : "search.aspx" }
  };
         
  $.fn.SiteBoxMIRROR.cssLib = {
    ui : { root : "sb", path : "ui.css" }
  };

  $.fn.SiteBoxMIRROR.jsLib = {
    codemirror   : { root : "cm", path : "lib/codemirror.js" },
    searchcursor : { root : "cm", path : "lib/util/searchcursor.js" },
    search       : { root : "sb", path : "search.js" },
    highlight    : { root : "cm", path : "lib/util/runmode.js" },
    css          : { root : "cm", path : "mode/css/css.js" },
    javascript   : { root : "cm", path : "mode/javascript/javascript.js" },
    xml          : { root : "cm", path : "mode/xml/xml.js" },
    htmlmixed    : { root : "cm", path : "mode/htmlmixed/htmlmixed.js" },
    xmlpure      : { root : "cm", path : "mode/xmlpure/xmlpure.js" },
    mysql        : { root : "sb", path : "mysql/mysql.js" }
  };

  $.fn.SiteBoxMIRROR.modes = {
    css        : "text/css",
    javascript : "text/javascript",
    htmlmixed  : "text/html",
    xmlpure    : "application/xml",
    mysql      : "text/x-mysql"
  };
  
  $.fn.SiteBoxMIRROR.buttons = {
    
    find : {
      icon   : { root : "sb", path : "find.png" },
      title  : "find",
      action : function($obj, ed, e){
         mirrorUiFindClick($obj, ed, e);
      }
    },

    indentSelected : {
      icon   : { root : "sb", path : "script_code.png" },
      title  : "indent selected",
      action : function($obj, ed, e){
         mirrorUiIndentSelectedClick($obj, ed, e);
      }
    },

    indentDocument : {
      icon   : { root : "sb", path : "script_code_red.png" },
      title  : "indent document",
      action : function($obj, ed, e){
         mirrorUiIndentDocumentClick($obj, ed, e);
      }
    },

    fullScreen : {
      icon   : { root : "sb", path : "monitor_go.png" },
      title  : "toggle fullscreen",
      action : function($obj, ed, e){
         mirrorUiToggleFullScreenClick($obj, ed, e);
      }
    }

  
  };
  
  // end of closure
})(jQuery);

//end ui/jquery.SiteBoxMirror.js