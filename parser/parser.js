var parser = require('luaparse');
var ast = parser.parse('a=12 \
while a == 12 do \
a=12 \
b = 10 \
c=40 \
	while true do \
		d=10\
		end \
		while true do end \
			while true do end \
end');

function genUid() {
  var length = 20;
  var soup = '!#%()*+,-./:;=?@[]^_`{|}~' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  var soupLength = soup.length;
  var id = [];
  for (var i = 0; i < length; i++) {
    id[i] = soup.charAt(Math.random() * soupLength);
  }
  return id.join('');
};

function NumericLiteral(ast) {
	var xml = '';

	xml += '<block type="math_number" id="'+genUid()+'">';
	xml += '<field name="NUM">' + ast.raw + '</field>';
	xml += '</block>';

	return xml;
}

function BooleanLiteral(ast) {
	var xml = '';

	xml += '<block type="logic_boolean" id="'+genUid()+'">';
	xml += '<field name="BOOL">' + ast.raw.toUpperCase() + '</field>';
	xml += '</block>';

	return xml;
}

function Identifier(ast) {
	var xml = '';
	
	xml += '<block type="variables_get" id="'+genUid()+'">';
	xml += '<field name="VAR">' + ast.name + '</field>';
	xml += '</block>';
	
	return xml;
}

function UnaryExpression(ast) {
	var type = ast.type;
	var xml = '';

	if (type == 'UnaryExpression') {
		xml = Expression(ast.argument);
	} else if (type == 'BinaryExpression') {
			xml = BinaryExpression(ast);
	} else if (type == 'Identifier') {
		xml = Identifier(ast);
	} else if (type == 'BooleanLiteral') {
		xml = BooleanLiteral(ast);
	} else if (type == 'NumericLiteral') {
		xml = NumericLiteral(ast);
	} else {
		throw("missing unary expression type: " + type + ". " + JSON.stringify(ast));
	}
	
	return xml;
}

function Operator(operator) {
	if (operator == '==') {
		return '<field name="OP">EQ</field>';
	} else if (operator == '~=') {
		return '<field name="OP">NEQ</field>';
	} else if (operator == '<=') {
		return '<field name="OP">LTE</field>';
	} else if (operator == '<') {
		return '<field name="OP">LT</field>';
	} else if (operator == '=>') {
		return '<field name="OP">GTE</field>';
	} else if (operator == '>') {
		return '<field name="OP">GT</field>';
	} else if (operator == '+') {
		return '<field name="OP">ADD</field>';
	} else if (operator == '-') {
		return '<field name="OP">MINUS</field>';
	} else if (operator == '*') {
		return '<field name="OP">MULTIPLY</field>';
	} else if (operator == '/') {
		return '<field name="OP">DIVIDE</field>';
	} else {
		throw("missing operator type: " + operator);
	}
	
	return '';
}

function OperatorType(operator) {
	if (operator == '==') {
		return 'logic_compare';
	} else if (operator == '~=') {
		return 'logic_compare';
	} else if (operator == '<=') {
		return 'logic_compare';
	} else if (operator == '<') {
		return 'logic_compare';
	} else if (operator == '=>') {
		return 'logic_compare';
	} else if (operator == '>') {
		return 'logic_compare';
	} else if (operator == '+') {
		return 'math_arithmetic';
	} else if (operator == '-') {
		return 'math_arithmetic';
	} else if (operator == '/') {
		return 'math_arithmetic';
	} else if (operator == '*') {
		return 'math_arithmetic';
	} else {
		throw("missing operator type: " + operator);
	}
}

function BinaryExpression(ast) {
	var xml = '';
	
	var xmlLeft = UnaryExpression(ast.left);
	var xmlRight = UnaryExpression(ast.right);	

	var operatorType = OperatorType(ast.operator);
	
	if (operatorType == 'logic_compare') {
		xml += '<block type="logic_compare" id="'+genUid()+'">';
		xml += Operator(ast.operator);
		xml += '<value name="A">';
		xml += xmlLeft;
		xml += '</value>';
		xml += '<value name="B">';
		xml += xmlRight;
		xml += '</value>';
		xml += '</block>';	
	} else if (operatorType == 'math_arithmetic') {
		xml += '<block type="math_arithmetic" id="'+genUid()+'">';
		xml += Operator(ast.operator);
		xml += '<value name="A">';
		xml += xmlLeft;
		xml += '</value>';
		xml += '<value name="B">';
		xml += xmlRight;
		xml += '</value>';
		xml += '</block>';	
	} else {
		throw("not found operator type: " + operator);
	}
	
	return xml;
}

function Expression(ast) {
	var type = ast.type;
	var xml = '';
	
	if (type == 'BinaryExpression') {
		xml = BinaryExpression(ast);
	} else if (type == 'UnaryExpression') {
		xml = UnaryExpression(ast);
	} else if (type == 'BooleanLiteral') {
		xml = BooleanLiteral(ast);
	} else if (type == 'Identifier') {
		xml = Identifier(ast);
	} else if (type == 'NumericLiteral') {
		xml = NumericLiteral(ast);
	} else {
		throw("missing expression type: " + type + ". " + JSON.stringify(ast));
	}
	
	return xml;
}

function AssignmentStatement(ast) {
	var xml = '';
	
	xml += '<block type="variables_set" id="'+genUid()+'">';
	xml += '<field name="VAR">' + ast.variables[0].name +'</field>';
	xml += '<value name="VALUE">' + Expression(ast.init[0]) +'</value>';
	xml += '<next></next>';
	xml += '</block>';
	
	return xml;
}

var pos = 0;

function WhileStatement(ast) {
	var xml = '';

	pos = pos + 200;
	
	xml += '<block type="controls_whileUntil" id="'+genUid()+'">';
	xml += '<field name="MODE">WHILE</field>';
	xml += '<value name="BOOL">';
	xml += 	Expression(ast.condition);
	xml += '</value>';
	xml += '<statement name="DO">';
	xml += body(ast.body);
	xml += '</statement>';
	xml += '<next></next>';
	xml += '</block>';
	
	return xml;
}

function body(ast) {
	var type;
	var xml = '';
	var tmp = '';
	
	for(var i=0;i < ast.length;i++) {
		type = ast[i].type;
		
		if (type == 'WhileStatement') {
			tmp = WhileStatement(ast[i]);
		} else if (type == 'AssignmentStatement') {
			tmp = AssignmentStatement(ast[i]);
		} else {
			throw("missing body type: " + type + ". " + JSON.stringify(ast));
		}
		
		if (xml.indexOf('<next></next>') != -1) {
			xml = xml.replace('<next></next>', '<next>' + tmp + '</next>');		
		} else {
			xml += tmp;
		}
		
	}
	
	xml = xml.replace('<next></next>','');
	
	return xml;
}

var xml = body(ast.body);

xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' + xml + '<xml>';

console.log(xml);