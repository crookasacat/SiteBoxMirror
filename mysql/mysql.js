/*

 MySql Parser for codemirror 2
 based on plsql mode, adapted to MySql by Richard Harvey ( http://www.crookasacat.com/ )
 December 2011 
 
*/


CodeMirror.defineMode("mysql", function(config, parserConfig) {
  var indentUnit       = config.indentUnit,
      keywords         = parserConfig.keywords,
      functions        = parserConfig.functions,
      types            = parserConfig.types,
      multiLineStrings = parserConfig.multiLineStrings;
  var isOperatorChar   = /[+\-*&%=<>!?:\/|]/;
  function chain(stream, state, f) {
    state.tokenize = f;
    return f(stream, state);
  }

  var type;
  function ret(tp, style) {
    type = tp;
    return style;
  }

  function tokenBase(stream, state) {
    var ch = stream.next();
    
    //start of quoted identifier?
    if(ch == '`' || ch == '"')
      return chain(stream, state, tokenIdentifier(ch));


    // start of string?
    else if (ch == '"' || ch == "'")
      return chain(stream, state, tokenString(ch));

    // is it one of (),;. 
    else if (/[\(\),;\.]/.test(ch))
      return ret(ch);
    
    // start of a number value?
    else if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return ret("number", "number");
    }
    
    // multi line comment or simple operator?
    else if (ch == "/") {
      if (stream.eat("*")) {
        return chain(stream, state, tokenComment);
      }
      else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator");
      }
    }
    
    // single line comment?
    else if (ch == "#") {
      stream.skipToEnd();
      return ret("comment", "comment");
    }

    // mysql user variable?
    else if (ch == "@") {
      stream.eatWhile(/[\w\d\$_]/);
      return ret("word", "variable");
    }
    
    // is it a operator?
    else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", "operator");
    }
    
    else {
      // get the whole word
      stream.eatWhile(/[\w\$_]/);

      // is it one of the listed keywords?
      if (keywords && keywords.propertyIsEnumerable(stream.current().toLowerCase())) return ret("keyword", "keyword");

      // is it one of the listed functions?
      if (functions && functions.propertyIsEnumerable(stream.current().toLowerCase())) return ret("keyword", "builtin");

      // is it one of the listed types?
      if (types && types.propertyIsEnumerable(stream.current().toLowerCase())) return ret("keyword", "variable-2");
      
      return ret("word", "word");
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && next == "\\";
      }
      if (end || !(escaped || multiLineStrings))
        state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenIdentifier(quote) {
    return function(stream, state) {
      while ((next = stream.next()) != null) {
        if (next == quote) {end = true; break;}
      }
      if (end)
        state.tokenize = tokenBase;
      return ret("identifier", "attribute");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  // Interface

  return {
    startState: function(basecolumn) {
      return {
        tokenize: tokenBase,
        startOfLine: true
      };
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      return style;
    }
  };
});

(function() {
  function keywords(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  
  var sqlKeywords = "alter auto_increment grant revoke primary key table start top transaction select update insert delete create describe " +
    "from into values where join inner left natural and or in not xor like using on order group by asc desc limit offset " +
    "union all as distinct set commit rollback replace view database separator if exists null truncate status show lock " +
    "unique having drop procedure begin end delimiter call else leave declare temporary then engine";

  
  var sqlFunctions = "abs acos adddate aes_encrypt aes_decrypt ascii asin atan atan2 avg benchmark bin bit_and " +
    "bit_count bit_length bit_or cast ceil ceiling char_length character_length coalesce concat concat_ws " +
    "connection_id conv convert cos cot count curdate current_date current_time current_timestamp current_user " +
    "curtime database date_add date_format date_sub dayname dayofmonth dayofweek dayofyear decode degrees" +
    "des_encrypt des_decrypt elt encode encrypt exp export_set extract field find_in_set floor format " +
    "found_rows from_days from_unixtime get_lock greatest group_unique_users hex ifnull inet_aton inet_ntoa instr " +
    "interval is_free_lock isnull last_insert_id lcase least left length ln load_file locate log log2 log10 " +
    "lower lpad ltrim make_set master_pos_wait max md5 mid min mod monthname now nullif oct octet_length " +
    "ord password period_add period_diff pi position pow power quarter quote radians rand release_lock " +
    "repeat reverse right round rpad rtrim sec_to_time session_user sha sha1 sign sin soundex space sqrt " +
    "std stddev strcmp subdate substring substring_index sum sysdate system_user tan time_format time_to_sec " +
    "to_days trim ucase unique_users unix_timestamp upper user version week weekday yearweek";

  var sqlTypes = "bigint binary bit blob bool char character date datetime dec decimal double enum float float4 float8 " + 
    "int int1 int2 int3 int4 int8 integer long longblob longtext mediumblob mediumint mediumtext middleint nchar" +
    "numeric real set smallint text time timestamp tinyblob tinyint tinytext varbinary varchar year";
  
  CodeMirror.defineMIME("text/x-mysql", {
    name: "mysql",
    keywords: keywords(sqlKeywords),
    functions: keywords(sqlFunctions),
    types: keywords(sqlTypes)
  });
}());
