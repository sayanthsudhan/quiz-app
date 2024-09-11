import React from 'react';
import "./Options.css";

const Options = ({ options, selectedOption, onOptionChange }) => {
    return (
        <div className='options'>
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`option ${selectedOption === option ? "selected" : ""}`}
                    onClick={() => onOptionChange(option)}
                >
                    {option}
                </div>
            ))}
        </div>
    );
};

export default Options;
