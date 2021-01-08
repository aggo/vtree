import StringNode from '../node/string.js';
import ArrayNode from '../node/array.js';
import TableNode from '../node/table.js';
import DummyNode from '../node/dummy.js';

import LinkNameDecorator from '../decorator/linkName.js';


export default class ObjectReader {
  constructor() {
  }

  read(obj, maxDepth) {
    return obj2node(obj, '',  maxDepth, 0);
  }
}


function obj2node(obj, linkName, maxDepth, currentDepth) {
  if (currentDepth==maxDepth){
    return new StringNode("");
  }
  var node;

  if (isPrimitive(obj)) {
    node = new StringNode(obj);
  } else if (Array.isArray(obj)) {
    const nodes = [];

    obj.forEach((item, i) => {
      if (Array.isArray(item)) {
        node = new DummyNode(obj2node(item, '', maxDepth, currentDepth+1));
        node.decorators.push(new LinkNameDecorator(`${linkName}[${i}]`));
        nodes.push(node);
      } else {
        node = obj2node(item, `${linkName}[${i}]`, maxDepth, currentDepth+1);
        nodes.push(node);
      }
    });

    // empty array
    if (nodes.length === 0) {
      node = obj2node(null, `${linkName}[]`,  maxDepth, currentDepth+1);
      nodes.push(node);
    }

    node = new ArrayNode(nodes);
  } else {
    var name;
    var tbl = [];
    var children = [];

    for (name in obj) {
      if (!obj.hasOwnProperty(name)) {
        continue;
      }

      var data = obj[name];

      if (isPrimitive(data)) {
        tbl.push([name, data]);
      } else {
        children.push(obj2node(data, name, maxDepth, currentDepth+1));
      }
    }

    if (tbl.length === 0) {
      node = new TableNode([[' ', ' ']], children);
    } else {
      node = new TableNode(tbl, children);
    }

  }

  if (linkName !== '' && node.constructor !== ArrayNode) {
    node.decorators.push(new LinkNameDecorator(linkName));
  }

  return node;
}


function isPrimitive(d) {
  const type = typeof d;

  if (d === null || type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  return false;
}
