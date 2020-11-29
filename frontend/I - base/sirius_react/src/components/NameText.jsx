import React, { Component } from 'react';

/*const eng=	[ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
function rand(min,max) {
    return Math.round(Math.random() * (max - min) + min)
}*/

class NameText extends Component {
    state = {  };
    render() { //{eng[rand(0,eng.length-1)].toUpperCase()}
        return (
            <span className="name">
                F:\{this.props.name} {this.props.surname}&gt;
                <span className="keyboardText"></span>
                <span className="textCursor"></span>
            </span>
        );
    }
}
 
export default NameText;