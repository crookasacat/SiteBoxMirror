<!-- SiteboxMirror ui/search.aspx

This is the search dialoug popup. 


It works with the CodeMirror.Commands functionality defined in ui/search.js

File extention is .aspx so that the file can easily be loaded with a POST via ajax on a windows server. 
If you rename the file remember to change the default in ui/jquery.SiteBoxMirror.js or pass the new path via init.

HTML Elements in this file referenced by ui/search.js and ui/jquery.SiteBoxMirror.js
$("#mirrorSearch")
$("#mirrorSearch input.foundCount")


Uses jQuery.UI to style dialoug and buttons. 

-->



<div style="display:none;">
  
  <div id="mirrorSearch" class="siteBoxMirror-search">
    <input type="hidden" class="foundCount" value="0" />
    <div id="find">
      <label>
        search for : 
      </label>
      <input type="text" class="findText" value="" />
      <input type="button" id="findBtn" value="find" />
      <input type="button" id="clearBtn" value="clear" />
    </div>
    
    <div id="replace" style="display:none;">
      <label>
        replace with : 
      </label>
      <input type="text" class="replaceText" value="" />
      <label style="width:63px;padding-left:5px;">
        replace all  
      </label>
      <input type="checkbox" class="globalReplace" value="all" />
      <input type="button" id="replaceBtn" value="replace" />
    </div>
    
  </div>
  
  <script type="text/javascript">
    $(document).ready(function(){
      
      $("input:button", "#mirrorSearch" ).button();
      
      $("#findBtn").click(function(){
        var q = $("#find input.findText").val();
        var e = $("#mirrorSearch").data("editorInstance");
        if(q=="") return;
        CodeMirror.commands.uiFind(e, q);
        configUiSearch();
      });
      
      $("#clearBtn").click(function(){
        $("#find input.findText").val("");
        $("#replace input.replaceText").val("");
        var e = $("#mirrorSearch").data("editorInstance");
        CodeMirror.commands.uiClearSearch(e);
        configUiSearch();
      });
      
      $("#replaceBtn").click(function(){
        
        var q = $("#find input.findText").val();
        var t = $("#replace input.replaceText").val();
        var e = $("#mirrorSearch").data("editorInstance");
        var g = $("#replace input:checkbox:checked.globalReplace").val();
        
        if(g=="all"){
          CodeMirror.commands.uiReplaceAll(e, q, t);
        }
        else{
          CodeMirror.commands.uiReplaceSelection(e, q, t);
        }
        configUiSearch();
      });
      
      
    });
    
    function configUiSearch(){
      var matches = $("#mirrorSearch input.foundCount").val();
      var q = $("#find input.findText").val();
      var title;

      if(matches == 0){
        $("#replace").hide();
      }
      else{
        $("#replace").show();
      }

      switch(matches){
        case 0:
          title="search - no matches [" + q + "]";

          break;
        case 1:
          title="search - 1 match [" + q + "]";
          break;
        default:
          title="search - " + matches + " matches [" + q + "]";
          break;
      }
      $("#ui-dialog-title-mirrorSearch").text(title);
    }
    
  </script>
</div>
