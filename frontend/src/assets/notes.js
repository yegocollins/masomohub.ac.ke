

//

class MyClass{
    constructor(name){ 
        this.name = name;
    }
}

class AnotherClass extends MyClass{
    constructor(name, model){
        super(name);
        this.model = model;
    }
}