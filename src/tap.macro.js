import {
  isCallExpression,
  identifier,
  memberExpression,
  callExpression,
  isExpression,
  parenthesizedExpression,
  sequenceExpression,
  addComment,
  assignmentExpression
} from "@babel/types";
import { createMacro } from "babel-plugin-macros";

export default createMacro(consoleTapMacro);

function consoleTapMacro({ references }) {
  /*
   * references is a collection of all instances of the imported macro.
   * `references.default` represents the usage of `import macro from 'my-macro-name'`
   * `references.x` would represent the usage of `import { x } from 'my-macro-name'`
   * Each selection contains an array of BabelPaths representing the arguments passed into the macro
   */
  references.default.forEach(referencePath => {
    /* BabelPath - https://bit.ly/2KOWR51#paths
     * In Babel the "path" is a meta representaiton of a node and its relationship to the tree.
     * Path contains information about a node's parent-child relationship, as well as methods to update a node's place in the tree.
     * Most tree manipulation is done with the path object instead of the node because the path is "reactive" to changes in the tree
     */
    if (isCallExpression(referencePath.parentPath)) {
      transformTapToLog(referencePath.parentPath);
    } else {
      throw new Error(
        `This is not supported: \`${referencePath
          .findParent(isExpression) // https://bit.ly/2KOWR51#find-a-specific-parent-path
          .getSource()}\`.`
      );
    }
  });
}

const buildConsoleLog = args =>
  // Add's the `()` to a `console.log` so it actually gets called
  callExpression(
    // States that we are accessing a value from an object, essentially joins two expressions with the `.`
    memberExpression(identifier("console"), identifier("log")),
    args
  );

// while path holds the node's metadata, we need the node's actual data, like name and value
const getFunctionCallParams = callExpressionPath =>
  callExpressionPath.get("arguments").map(np => np.node);

// convert `console.tap( value, optional, values)` to ( __tapValue__ = value, console.log(__tapValue__, optional, values), __tapValue__ )
function transformTapToLog(callExpressionPath) {
  // `tapValue` is the value that will be logged and then returned, `rest` are optional values that will be logged, but not returned
  const [tapValue, ...rest] = getFunctionCallParams(callExpressionPath);

  // create the `__tapValue__ = value` portion to create the value in scope
  const assignment = assignmentExpression(
    "=",
    identifier("__tapValue__"),
    tapValue
  );

  const logCall = buildConsoleLog([identifier("__tapValue__"), ...rest]);

  // organizes all portions so everything happens in order
  const sequence = sequenceExpression([
    assignment,
    logCall,
    identifier("__tapValue__")
  ]);

  const parensed = parenthesizedExpression(sequence);
  addComment(parensed, "leading", "prettier-ignore", false); // by adding the comment as trailing, it will appear right after the code and not on a new line and preserve the original code's lines

  callExpressionPath.replaceWith(parensed);
}
