import React from 'react'
import CTAButton from "./Button";
import HighlightText from './HighlightText';
import { FaArrowRight } from "react-icons/fa6"; 
import { TypeAnimation } from 'react-type-animation'; 

const CodeBlocks = ({
    position, heading, subheading, ctabtn1, ctabtn2, codeblock, backgroundGradient, codeColor
}) => {
    return (
        <div className={`flex ${position} my-20 justify-between gap-10 flex-wrap`}>
            {/* section 1  */}
            <div className='lg:w-[50%] flex flex-col gap-8'>
                {heading}
                <div className='text-richblack-300 font-bold md:text-lg '>
                    {subheading}
                </div>
                <div className='flex gap-7 mt-7'>
                    <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
                        <div className='flex gap-2 items-center'>
                            {ctabtn1.btnText}
                            <FaArrowRight />
                        </div>
                    </CTAButton>
                    <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>

                        {ctabtn2.btnText}

                    </CTAButton>
                </div>
            </div>

            {/* section 2 */}
            <div className='h-fit flex flex-row text-[10px] w-[100%] py-2 lg:w-[500px]'> 
    
                {/* hw bg gradient  */}
                <div className='text-center flex flex-col w-[10%] text-richblack-400 font-inter font-bold'>
                    <p>1</p>
                    <p>2</p>
                    <p>3</p>
                    <p>4</p>
                    <p>5</p>
                    <p>6</p>
                    <p>7</p>
                    <p>8</p>
                    <p>9</p>
                    <p>10</p>
                    <p>11</p>
                </div> 
                <div className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} relative`}> 
                <div className={`${backgroundGradient} absolute`}></div>
                   <TypeAnimation 
                     sequence={[codeblock,2000,""]} 
                     repeat={Infinity} 
                     cursor={true}  
                     omitDeletionAnimation={true}
                     style={
                        {
                            whiteSpace:"pre-line", 
                            display:"block"
                        }
                     }
                     
                    />
                </div>
            </div>
        </div>
    )
}

export default CodeBlocks