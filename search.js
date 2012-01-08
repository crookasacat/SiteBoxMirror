
// SiteboxMirror ui/search.js
// Define search commands for SiteboxMirror ui. 
// adapted from original codemirror 2 code at lib/utils/search.js
// depends upon original codemirror 2 code at lib/utils/searchCursor.js

(function() {

  function SearchState() {
    this.posFrom = this.posTo = this.query = null;
    this.marked = [];
  }

  function getSearchState(cm) {
    return cm._searchState || (cm._searchState = new SearchState());
  }
  
  function parseQuery(query) {
    var isRE = query.match(/^\/(.*)\/$/);
    return isRE ? new RegExp(isRE[1]) : query;
  }

  function doSearch(cm, rev, query) {

    var state = getSearchState(cm);
    if (state.query) return findNext(cm, rev);

    cm.operation(function() {
      if (!query || state.query) return;
      state.query = parseQuery(query);
      if (cm.lineCount() < 2000) { // This is too expensive on big documents.
        for (var cursor = cm.getSearchCursor(query); cursor.findNext();)
          state.marked.push(cm.markText(cursor.from(), cursor.to(), "CodeMirror-searching"));
      }
      state.posFrom = state.posTo = cm.getCursor();
      findNext(cm, rev);
    });
  }
  
  function findNext(cm, rev) {
    cm.operation(function() {
      var state = getSearchState(cm);
      var cursor = cm.getSearchCursor(state.query, rev ? state.posFrom : state.posTo);
      if (!cursor.find(rev)) {
        cursor = cm.getSearchCursor(state.query, rev ? {line: cm.lineCount() - 1} : {line: 0, ch: 0});
        if (!cursor.find(rev)) return;
      }
      cm.setSelection(cursor.from(), cursor.to());
      state.posFrom = cursor.from(); state.posTo = cursor.to();
    });
  }

  function clearSearch(cm) {
    cm.operation(function() {
      var state = getSearchState(cm);
      if (!state.query) return;
      state.query = null;
      for (var i = 0; i < state.marked.length; ++i) state.marked[i].clear();
      state.marked.length = 0;
    });
  }
  
  function replaceAll(cm, query, text) {
    if (!query) return;
    query = parseQuery(query);
    cm.operation(function() {
      for (var cursor = cm.getSearchCursor(query); cursor.findNext();) {
        if (typeof query != "string") {
          var match = cm.getRange(cursor.from(), cursor.to()).match(query);
          cursor.replace(text.replace(/\$(\d)/, function(w, i) {return match[i];}));
        } 
        else cursor.replace(text);
      }
    });
  }

  function replaceSelection(cm, query, text) {
    
    var state = getSearchState(cm);
    var selectedText = cm.getSelection();
    var searchText = cm.getRange(state.posFrom, state.posTo);

    if(selectedText != searchText) return;
    if(selectedText == "") return;

    var q = parseQuery(query);
    if (typeof q != "string") {
      if(!q.test(selectedText)) return;
    }
    else
    {
      if(q != selectedText) return;
    }
    cm.replaceSelection(text);
  }

  function updateFoundCount(cm, clearMode){
    var s = getSearchState(cm);

    var count = s.marked.length;
    if(count == 0){
      var searchText = cm.getRange(s.posFrom, s.posTo);
      if(searchText == "" || clearMode){
        cm.setSelection(cm.getCursor());
      }
      else{
        count = 1;
      }
    }
    $("#mirrorSearch .foundCount").val(count);
  }
  

  CodeMirror.commands.uiFind = function(cm, query) {
    cm.focus();
    clearSearch(cm); 
    doSearch(cm, false, query);
    updateFoundCount(cm, false);
  };

  CodeMirror.commands.uiClearSearch = function(cm){
    cm.focus();
    clearSearch(cm);
    updateFoundCount(cm, true);
    
  }
  
  CodeMirror.commands.uiReplaceSelection = function(cm, query, text) { 
    cm.focus();
    replaceSelection(cm, query, text); 
    clearSearch(cm); 
    doSearch(cm, false, query);
    updateFoundCount(cm, false);
  };
  

  CodeMirror.commands.uiReplaceAll = function(cm, query, text) { 
    cm.focus();
    replaceAll(cm, query, text);
    clearSearch(cm);
    updateFoundCount(cm, true);
  };
  

})();

// end SiteboxMirror ui/search.js 
