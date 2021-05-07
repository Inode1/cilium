function runWhenDOMLoaded(cb) {
  if (document.readyState !== "loading") {
    cb();
  } else if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    document.attachEvent("onreadystatechange", function() {
      if (document.readyState == "complete") cb();
    });
  }
}

function codeCellId(index) {
  return "codecell" + index;
}

function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

function addCopyButtonToCodeCells() {
  if (window.ClipboardJS === undefined) {
    setTimeout(addCopyButtonToCodeCells, 1000);
    return;
  }
  const promptRegExp = /^\s*(\$|#)\s/;
  var codeCells = document.querySelectorAll(".rst-content pre");
  codeCells.forEach(function(codeCell, index) {
    var wrapper = document.createElement("div");
    wrapper.className = "code-wrapper";
    codeCell.parentNode.insertBefore(wrapper, codeCell);
    wrapper.appendChild(codeCell);
    var id = codeCellId(index);
    codeCell.setAttribute("id", id);
    function clipboardButton(id) {
      var lines = codeCell.textContent.trim().split("\n");
      var linesCount = lines.length;
      var buttonHtml = [];
      buttonHtml.push('<div class="copybutton-wrapper">');
      buttonHtml.push(
        '<img class="copy-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACiUExURUdwTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJkEv5MAAAA1dFJOUwAwnr/H5BShnG3DCRPPm5OdyC4jGzHhB7o4AmkDyTJE1vn6ymWjbAHtTIQE6dwNoGH71I2zlJ78SQAAAI9JREFUKM/t0kcOwkAMhWGnTZhUOoQWeu8w979aJEDiOWhGOQD/wpL1LbwxER32ivUU9E0e6zXsngDOfWLJGBZVwl36i6H4FL3mCDGfeqygDegkFjYZ9wEbQ37ZVoCu5Oj/sSLaBnSCTjPUYSv2upkOqSeigRbJcPPdYs1xNYMlPbHvvWyXgOcHe/vbdUPmCj5KFX8s6tJBAAAAAElFTkSuQmCC" alt="" />'
      );
      buttonHtml.push(
        '<a class="copybutton" data-clipboard-mode="first-line" data-clipboard-target="#' +
          id +
          '">'
      );
      buttonHtml.push(linesCount > 1 ? "Copy First Line" : "Copy Line");
      buttonHtml.push("</a>");
      if (linesCount > 1) {
        /*
         * Add a button to print commands for literal and code blocks that may
         * have prompt symbols to distinguish the commands from their output.
         *
         * Add it to:
         * - "code-block" with language "shell-session", with a parent of class
         *   ".highlight-shell-session"
         * - Literal blocks ("::"), with a parent of class ".highlight-default"
         * - Parsed literal blocks, with a parent of class ".literal-block"
         *
         * Do not add it to a "code-block" with a language other than
         * "shell-session".
         */
        if (codeCell.closest(".highlight-shell-session") ||
            codeCell.closest(".highlight-default") ||
            codeCell.closest("literal-block")) {
          for (const l of lines) {
            /* Additionally, only add button if we find at least one command */
            if (promptRegExp.test(l)) {
              buttonHtml.push(
                '<a class="copybutton" data-clipboard-mode="commands"  data-clipboard-target="#' +
                  id +
                  '">'
              );
              buttonHtml.push("Copy Commands");
              buttonHtml.push("</a>");
              break;
            }
          }
        }

        buttonHtml.push(
          '<a class="copybutton" data-clipboard-mode="all"  data-clipboard-target="#' +
            id +
            '">'
        );
        buttonHtml.push("Copy All");
        buttonHtml.push("</a>");
      }
      buttonHtml.push("</div>");
      return buttonHtml.join("\n");
    }
    codeCell.insertAdjacentHTML("afterend", clipboardButton(id));
  });

  new ClipboardJS(".copybutton", {
    text: function(trigger) {
      var parent = trigger.parentNode.parentNode;
      var code = parent.querySelector("pre");
      var mode = trigger.getAttribute("data-clipboard-mode");
      if (mode === "first-line") {
        return code.textContent
          .split("\n")[0]
          .trim()
          .replace(/^\$/, "")
          .trim();
      } else if (mode === "commands") {
        /*
         * Copy lines with "commands": each line starting with a prompt symbol
         * ($ or #), plus the continuation lines, for commands ending with a
         * backslash.
         */
        var cmds = "";
        var continuation = false;
        var lines = code.textContent.split("\n");
        for (const l of lines) {
          if (promptRegExp.test(l) || continuation) {
            /* Keep line but remove prompt */
            cmds += l.replace(promptRegExp, "") + "\n";
            /* Expect a continuation line if command ends with a backslash */
            continuation = /\\\s*$/.test(l);
          }
        }
        return cmds;
      } else {
        return code.textContent;
      }
    }
  });
}

runWhenDOMLoaded(addCopyButtonToCodeCells);
