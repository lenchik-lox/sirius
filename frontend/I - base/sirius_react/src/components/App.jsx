import React, { Component } from 'react';
import NameText from './NameText.jsx';
import Emoji from './Emoji.jsx';
import JinguLogo from './JinguLogo.jsx';

class App extends Component {
    state = {  }
    render() { 
        return (
        <div className="container">
            <JinguLogo/><br/>
            <NameText name="Kirill" surname="Kolosov"/><br/>
            <Emoji    /><br/>
            
        </div>);
    }
}
 
export default App;

