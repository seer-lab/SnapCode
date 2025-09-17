import { useState } from "react";
import "./Switch.css";

const Switch = ({ checked: initialChecked = false, onChange }) => {
    const [checked, setChecked] = useState(initialChecked);

    const handleChange = (e) => {
        setChecked(e.target.checked);
        if (onChange) onChange(e.target.checked);
        console.log(e.target.checked); 
    };

    return (
        <label className="switch">
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
            />
            <span className="slider round"></span>
        </label>
    );
};

export default Switch;