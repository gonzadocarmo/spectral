/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */

function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { JSONPath: peg$parseJSONPath },
      peg$startRuleFunction  = peg$parseJSONPath,

      peg$c0 = function(deep, step) { return { ...step, deep: deep !== null && deep[1] !== null } },
      peg$c1 = function(nodes, modifiers) { return [...nodes].concat(Array.isArray(modifiers) ? modifiers : modifiers === null ? [] : modifiers) },
      peg$c2 = "$",
      peg$c3 = peg$literalExpectation("$", false),
      peg$c4 = "[",
      peg$c5 = peg$literalExpectation("[", false),
      peg$c6 = "]",
      peg$c7 = peg$literalExpectation("]", false),
      peg$c8 = function(value) { return value },
      peg$c9 = function(value) { return { type: "MemberExpression", value } },
      peg$c10 = function() { return { type: "WildcardExpression" } },
      peg$c11 = function(expression) { return expression },
      peg$c12 = ",",
      peg$c13 = peg$literalExpectation(",", false),
      peg$c14 = function(value) { return { type: "MultipleMemberExpression", value: [...new Set(value)] } },
      peg$c15 = "(",
      peg$c16 = peg$literalExpectation("(", false),
      peg$c17 = ")",
      peg$c18 = peg$literalExpectation(")", false),
      peg$c20 = "?(",
      peg$c21 = peg$literalExpectation("?(", false),
      peg$c22 = function(value) { return { type: "ScriptFilterExpression", value } },
      peg$c23 = ":",
      peg$c24 = peg$literalExpectation(":", false),
      peg$c25 = function(value) { return { type: "SliceExpression", value: value.split(":") } },
      peg$c26 = "~",
      peg$c27 = peg$literalExpectation("~", false),
      peg$c28 = function() { return { type: "KeyExpression" } },
      peg$c29 = "^",
      peg$c30 = peg$literalExpectation("^", false),
      peg$c31 = function() { return { type: "ParentExpression" } },
      peg$c32 = /^[.]/,
      peg$c33 = peg$classExpectation(["."], false, false),
      peg$c34 = /^[\-]/,
      peg$c35 = peg$classExpectation(["-"], false, false),
      peg$c36 = "\"",
      peg$c37 = peg$literalExpectation("\"", false),
      peg$c38 = /^[^"]/,
      peg$c39 = peg$classExpectation(["\""], true, false),
      peg$c40 = "'",
      peg$c41 = peg$literalExpectation("'", false),
      peg$c42 = /^[^']/,
      peg$c43 = peg$classExpectation(["'"], true, false),
      peg$c44 = function() { return text().slice(1, -1) },
      peg$c45 = "-",
      peg$c46 = peg$literalExpectation("-", false),
      peg$c47 = function() { return Number(text()); },
      peg$c48 = "*",
      peg$c49 = peg$literalExpectation("*", false),
      peg$c50 = /^[A-Za-z]/,
      peg$c51 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false),
      peg$c52 = /^[0-9]/,
      peg$c53 = peg$classExpectation([["0", "9"]], false, false),
      peg$c54 = /^["]/,
      peg$c55 = peg$classExpectation(["\""], false, false),
      peg$c56 = /^[']/,
      peg$c57 = peg$classExpectation(["'"], false, false),
      peg$c58 = /^[ $@._=<>!|&+]/,
      peg$c59 = peg$classExpectation([" ", "$", "@", ".", "_", "=", "<", ">", "!", "|", "&", "+"], false, false),

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseJSONPath() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseRoot();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parseDescendant();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseNode();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s3;
          s4 = peg$c0(s4, s5);
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parseDescendant();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseNode();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s3;
            s4 = peg$c0(s4, s5);
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseModifier();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1(s2, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseRoot() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 36) {
      s0 = peg$c2;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c3); }
    }

    return s0;
  }

  function peg$parseNode() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseIdentifier();
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c4;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        { peg$fail(peg$c5); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseMemberIdentifier();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s4 = peg$c6;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            { peg$fail(peg$c7); }
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s1;
            s2 = peg$c8(s3);
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c9(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseWildcard();
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
          s2 = peg$c4;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          { peg$fail(peg$c5); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseWildcard();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s4 = peg$c6;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              { peg$fail(peg$c7); }
            }
            if (s4 !== peg$FAILED) {
              s2 = [s2, s3, s4];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c10();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c4;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          { peg$fail(peg$c5); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseScriptFilterExpression();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s3 = peg$c6;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              { peg$fail(peg$c7); }
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c11(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c4;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            { peg$fail(peg$c5); }
          }
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseMemberIdentifier();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c12;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                { peg$fail(peg$c13); }
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s3;
                s4 = peg$c8(s4);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$currPos;
              s4 = peg$parseMemberIdentifier();
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c12;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  { peg$fail(peg$c13); }
                }
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s3;
                  s4 = peg$c8(s4);
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s3 = peg$c6;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                { peg$fail(peg$c7); }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c4;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c5); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseSliceExpression();
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s3 = peg$c6;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  { peg$fail(peg$c7); }
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c11(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseScriptFilterExpression() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c20) {
      s1 = peg$c20;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c21); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseJSScript();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 41) {
          s3 = peg$c17;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c18); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c22(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSliceExpression() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$currPos;
    s4 = peg$parseNumber();
    if (s4 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 58) {
        s5 = peg$c23;
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        { peg$fail(peg$c24); }
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parseNumber();
        if (s6 !== peg$FAILED) {
          s4 = [s4, s5, s6];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 === peg$FAILED) {
      s3 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s4 = peg$c23;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        { peg$fail(peg$c24); }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseNumber();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        s3 = peg$parseNumber();
      }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s5 = peg$c23;
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        { peg$fail(peg$c24); }
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parseNumber();
        if (s6 !== peg$FAILED) {
          s5 = [s5, s6];
          s4 = s5;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c25(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseKeyExpression() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 126) {
      s1 = peg$c26;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c27); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c28();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseParentExpression() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 94) {
      s1 = peg$c29;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c30); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c31();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseModifier() {
    var s0, s1, s2;

    s0 = peg$parseKeyExpression();
    if (s0 === peg$FAILED) {
      s0 = [];
      s1 = peg$parseParentExpression();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseParentExpression();
        }
      } else {
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseParentExpression();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseParentExpression();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseKeyExpression();
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parseDescendant() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (peg$c32.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c33); }
    }
    if (s1 !== peg$FAILED) {
      if (peg$c32.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        { peg$fail(peg$c33); }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIdentifier() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseChar();
    if (s2 !== peg$FAILED) {
      s3 = [];
      s4 = peg$parseChar();
      if (s4 === peg$FAILED) {
        s4 = peg$parseDigit();
        if (s4 === peg$FAILED) {
          if (peg$c34.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            { peg$fail(peg$c35); }
          }
        }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parseChar();
        if (s4 === peg$FAILED) {
          s4 = peg$parseDigit();
          if (s4 === peg$FAILED) {
            if (peg$c34.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              { peg$fail(peg$c35); }
            }
          }
        }
      }
      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }

    return s0;
  }

  function peg$parseMemberIdentifier() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$parseNumber();
    if (s0 === peg$FAILED) {
      s0 = peg$parseIdentifier();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s2 = peg$c36;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          { peg$fail(peg$c37); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = [];
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            { peg$fail(peg$c39); }
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (peg$c38.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              { peg$fail(peg$c39); }
            }
          }
          if (s4 !== peg$FAILED) {
            s3 = input.substring(s3, peg$currPos);
          } else {
            s3 = s4;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s4 = peg$c36;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              { peg$fail(peg$c37); }
            }
            if (s4 !== peg$FAILED) {
              s2 = [s2, s3, s4];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 39) {
            s2 = peg$c40;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            { peg$fail(peg$c41); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            s4 = [];
            if (peg$c42.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              { peg$fail(peg$c43); }
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              if (peg$c42.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                { peg$fail(peg$c43); }
              }
            }
            if (s4 !== peg$FAILED) {
              s3 = input.substring(s3, peg$currPos);
            } else {
              s3 = s4;
            }
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 39) {
                s4 = peg$c40;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                { peg$fail(peg$c41); }
              }
              if (s4 !== peg$FAILED) {
                s2 = [s2, s3, s4];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c44();
        }
        s0 = s1;
      }
    }

    return s0;
  }

  function peg$parseNumber() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 45) {
      s1 = peg$c45;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c46); }
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseDigit();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDigit();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c47();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseWildcard() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 42) {
      s0 = peg$c48;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c49); }
    }

    return s0;
  }

  function peg$parseChar() {
    var s0;

    if (peg$c50.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c51); }
    }

    return s0;
  }

  function peg$parseDigit() {
    var s0;

    if (peg$c52.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c53); }
    }

    return s0;
  }

  function peg$parseJSScript() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseChar();
    if (s2 === peg$FAILED) {
      s2 = peg$parseDigit();
      if (s2 === peg$FAILED) {
        s2 = peg$parseJSToken();
        if (s2 === peg$FAILED) {
          s2 = peg$parseJSString();
          if (s2 === peg$FAILED) {
            s2 = peg$parseJSScriptElementAccess();
            if (s2 === peg$FAILED) {
              s2 = peg$parseJSFnCall();
            }
          }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseChar();
        if (s2 === peg$FAILED) {
          s2 = peg$parseDigit();
          if (s2 === peg$FAILED) {
            s2 = peg$parseJSToken();
            if (s2 === peg$FAILED) {
              s2 = peg$parseJSString();
              if (s2 === peg$FAILED) {
                s2 = peg$parseJSScriptElementAccess();
                if (s2 === peg$FAILED) {
                  s2 = peg$parseJSFnCall();
                }
              }
            }
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }

    return s0;
  }

  function peg$parseJSScriptElementAccess() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c4;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c5); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseDigit();
      if (s3 === peg$FAILED) {
        s3 = peg$parseChar();
        if (s3 === peg$FAILED) {
          s3 = peg$parseJSString();
          if (s3 === peg$FAILED) {
            s3 = peg$parseJSFnCall();
          }
        }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseDigit();
        if (s3 === peg$FAILED) {
          s3 = peg$parseChar();
          if (s3 === peg$FAILED) {
            s3 = peg$parseJSString();
            if (s3 === peg$FAILED) {
              s3 = peg$parseJSFnCall();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c6;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c7); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseJSString() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c54.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c55); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c38.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        { peg$fail(peg$c39); }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        if (peg$c38.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c39); }
        }
      }
      if (s2 !== peg$FAILED) {
        if (peg$c54.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c55); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (peg$c56.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        { peg$fail(peg$c57); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c42.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c43); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c42.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            { peg$fail(peg$c43); }
          }
        }
        if (s2 !== peg$FAILED) {
          if (peg$c56.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            { peg$fail(peg$c57); }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseJSToken() {
    var s0;

    if (peg$c58.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c59); }
    }

    return s0;
  }

  function peg$parseJSFnCall() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c15;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c16); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseJSString();
      if (s3 === peg$FAILED) {
        s3 = peg$parseChar();
        if (s3 === peg$FAILED) {
          s3 = peg$parseDigit();
          if (s3 === peg$FAILED) {
            s3 = peg$parseJSScriptElementAccess();
            if (s3 === peg$FAILED) {
              s3 = peg$parseJSFnCall();
            }
          }
        }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseJSString();
        if (s3 === peg$FAILED) {
          s3 = peg$parseChar();
          if (s3 === peg$FAILED) {
            s3 = peg$parseDigit();
            if (s3 === peg$FAILED) {
              s3 = peg$parseJSScriptElementAccess();
              if (s3 === peg$FAILED) {
                s3 = peg$parseJSFnCall();
              }
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 41) {
          s3 = peg$c17;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c18); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

var parser = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};

export default parser;
