var wap = (function () {
    function wap() {
        this.RAM = new Array(256);
        this.ROM = "";
        this.AC = 0x00;
        this.PC = 0x00;
        this.CARRY = false;
        this.ZERO = false;
        this.DATA = false;
        this.RUNNING = false;
        for (var i = 0; i < this.RAM.length; i++) {
            this.RAM[i] = 0;
        }
    }
    wap.prototype.get_nn = function () {
        return parseInt("0x" + this.ROM[this.PC + 2] + this.ROM[this.PC + 1]);
    };
    wap.prototype.reset = function () {
        this.ROM = "0";
        this.AC = this.PC = 0x00;
        this.CARRY = this.ZERO = this.DATA = false;
        this.RUNNING = false;
        for (var i = 0; i < this.RAM.length; i++) {
            this.RAM[i] = 0;
        }
    };
    wap.prototype.halt = function (reason) {
        if (reason === void 0) { reason = ""; }
        this.RUNNING = false;
        this.log(reason, this.PC.toString(16).toUpperCase(), 1);
        this.PC = 0x00;
    };
    wap.prototype.log = function (reason, location, type) {
        if (location === void 0) { location = "0"; }
        if (type === void 0) { type = 3; }
        switch (type) {
            case 1:
                console.error("Error! 0x" + location.toUpperCase() + " (" + reason + ")");
                break;
            case 2:
                console.warn("Warning! 0x" + reason + " (0x" + location.toUpperCase() + ")");
                break;
            case 3:
                console.log(reason);
                break;
        }
    };
    wap.prototype.execute = function () {
        var jump = 0;
        switch (this.ROM[this.PC]) {
            case "0":
                this.halt();
                break;
            case "1":
                this.AC = this.RAM[this.get_nn()];
                jump = 3;
                break;
            case "2":
                this.RAM[this.get_nn()] = this.AC;
                jump = 3;
                break;
            case "3":
                this.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                this.PC = this.get_nn();
                break;
            case "4":
                this.RAM[this.get_nn()] = this.PC;
                jump = 3;
                break;
            case "5":
                if (this.RAM[this.get_nn()] && this.AC) {
                    this.AC = 1;
                    this.ZERO = false;
                }
                else {
                    this.AC = 0;
                    this.ZERO = true;
                }
                jump = 3;
                break;
            case "6":
                if (this.RAM[this.get_nn()] || this.AC) {
                    this.AC = 1;
                    this.ZERO = false;
                }
                else {
                    this.AC = 0;
                    this.ZERO = true;
                }
                jump = 3;
                break;
            case "7":
                this.AC = this.AC + this.RAM[this.get_nn()];
                if (this.AC > 255) {
                    this.AC -= 255;
                    this.CARRY = true;
                }
                else {
                    this.CARRY = false;
                }
                if (this.AC === 0) {
                    this.ZERO = true;
                }
                else {
                    this.ZERO = false;
                }
                jump = 3;
                break;
            case "8":
                this.AC = this.AC - this.RAM[this.get_nn()];
                if (this.AC < 0) {
                    this.AC += 255;
                    this.CARRY = true;
                }
                else {
                    this.CARRY = false;
                }
                if (this.AC === 0) {
                    this.ZERO = true;
                }
                else {
                    this.ZERO = false;
                }
                jump = 3;
                break;
            case "9":
                if (!this.ZERO) {
                    this.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
                break;
            case "a":
            case "A":
                var TEMP = this.AC - this.RAM[this.get_nn()];
                if (TEMP < 0) {
                    TEMP += 255;
                    this.CARRY = true;
                }
                else {
                    this.CARRY = false;
                }
                if (TEMP === 0) {
                    this.ZERO = true;
                }
                else {
                    this.ZERO = false;
                }
                jump = 3;
                break;
            case "b":
            case "B":
                if (!this.DATA) {
                    this.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
                break;
            case "c":
            case "C":
                if (!this.CARRY) {
                    this.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
                break;
            case "d":
            case "D":
                this.AC *= 2;
                jump = 1;
                break;
            case "e":
            case "E":
                this.AC /= 2;
                jump = 1;
                break;
            case "f":
            case "F":
                this.CARRY = this.ZERO = this.DATA = false;
                jump = 1;
                break;
            case undefined:
                this.halt("Undefined Instruction");
                break;
            default:
                this.halt("Illegal Instruction");
                break;
        }
        this.PC += jump;
    };
    return wap;
}());
var compiler = (function () {
    function compiler() {
        this.insts = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];
        this.no_operand = ["0", "d", "e", "f"];
        this.address_prefix = "$";
        this.comment_prefix = ";";
    }
    compiler.prototype.log = function (reason, location, type) {
        if (location === void 0) { location = "0"; }
        if (type === void 0) { type = 3; }
        switch (type) {
            case 1:
                console.error("Compilation error at 0x" + location.toUpperCase() + " (" + reason + ")");
                break;
            case 2:
                console.warn("Compilation warning! " + reason + " (0x" + location.toUpperCase() + ")");
                break;
            case 3:
                console.log(reason);
                break;
        }
    };
    compiler.prototype.compile = function (file) {
        if (!file)
            return "no file!";
        var binary = "";
        var lines = file.split(/\r?\n/);
        for (var k = 0; k < lines.length; k++) {
            if (lines[k].indexOf(this.comment_prefix) !== -1) {
                lines[k] = lines[k].replace(/;(.*)/g, "");
            }
        }
        for (var k = lines.length; k >= 0; k--) {
            if (lines[k] == "" || !/\S/g.test(lines[k])) {
                lines.splice(k, 1);
            }
        }
        for (var i = 0; i < lines.length; i++) {
            var opcode = "";
            for (var inst = 0; inst < this.insts.length; inst++) {
                if (lines[i].indexOf(this.insts[inst]) !== -1) {
                    opcode += inst.toString(16);
                    break;
                }
            }
            if (opcode == "") {
                this.log("Opcode not found!", i.toString(16), 1);
                return "error";
            }
            var requiresOperand = true;
            for (var j = 0; j < this.no_operand.length; j++) {
                if (opcode == this.no_operand[j]) {
                    requiresOperand = false;
                    break;
                }
            }
            if (requiresOperand) {
                if (lines[i].indexOf(this.address_prefix) !== -1) {
                    var numbers = lines[i].substr(lines[i].indexOf(this.address_prefix) + 1, 2);
                    numbers = numbers.split("").reverse().join("");
                    opcode += numbers;
                }
                else {
                    this.log("No operand found!", i.toString(16), 1);
                    return "error";
                }
            }
            else {
                if (lines[i].indexOf(this.address_prefix) !== -1) {
                    this.log("No operand required!", i.toString(16), 2);
                }
            }
            binary += opcode;
        }
        this.log("Compilation complete!");
        return binary;
    };
    return compiler;
}());
var disassembler = (function () {
    function disassembler() {
        this.insts = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];
        this.no_operand = ["0", "d", "e", "f"];
        this.address_prefix = "$";
        this.comment_prefix = ";";
        this.PC = 0x00;
        this.RUNNING = false;
    }
    disassembler.prototype.log = function (reason, location, type) {
        if (location === void 0) { location = "0"; }
        if (type === void 0) { type = 3; }
        switch (type) {
            case 1:
                console.error("Error! 0x" + location.toUpperCase() + " (" + reason + ")");
                break;
            case 2:
                console.warn("Warning! 0x" + reason + " (0x" + location.toUpperCase() + ")");
                break;
            case 3:
                console.log(reason);
                break;
        }
    };
    disassembler.prototype.disassemble = function (binary) {
        var file = "";
        this.RUNNING = true;
        var jump = 0;
        for (var i = 0; i < binary.length; i++) {
            if (isNaN(parseInt("0x" + binary[i])))
                return "Not a number! (0x" + i.toString(16).toUpperCase() + ")";
        }
        while (this.RUNNING) {
            jump = 3;
            var require_operand = true;
            for (var i = 0; i < this.no_operand.length; i++) {
                if (binary[this.PC] == this.no_operand[i]) {
                    require_operand = false;
                    jump = 1;
                    break;
                }
            }
            file += this.insts[parseInt("0x" + binary[this.PC])];
            if (require_operand)
                if (binary[this.PC + 1] == undefined || binary[this.PC + 2] == undefined)
                    return "Missing operand!";
                else
                    file += " " + this.address_prefix + binary[this.PC + 2] + binary[this.PC + 1];
            if (binary[this.PC + jump] === undefined)
                this.RUNNING = false;
            file += "\n";
            this.PC += jump;
        }
        this.PC = 0x00;
        return file;
    };
    return disassembler;
}());
