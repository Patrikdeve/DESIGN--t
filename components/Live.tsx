import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useMyPresence, useOthers } from '@/liveblocks.config'
import CursorChat from './cursor/CursorChat';
import { CursorMode } from '@/types/type';

const Live = () => {
    const others = useOthers();//This return the list of the other members in the room

    const [{cursor}, updateMyPresence] = useMyPresence() as any; 

    //Need to create the cursor state here
    const [cursorState, setCursorState] = useState({mode:CursorMode.Hidden})

    //Creating the functions here in order to know the position of cursors

    const handlePointerMove = useCallback((event:React.PointerEvent) => {
        event.preventDefault(); 

        //We got the Position of cursor
        const x = event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});
    }, [])
    
    //Function to handle case when our cursor leave the canvas
    const handlePointerLeave = useCallback((event:React.PointerEvent) => {
        setCursorState({mode: CursorMode.Hidden})
        
        updateMyPresence({cursor: null, message:null });
    }, [])



    const handlePointerDown = useCallback((event:React.PointerEvent) => {

        //We got the Position of cursor
        const x = event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});
    }, [])



//Now till above livecursor is ready to implement and turn the cursor chat mode chat to hidden and vice versa we are using useEffect HOOk

    useEffect(()=>{
        
        const onKeyUp = (e:KeyboardEvent) => {
            
            if(cursorState.mode === CursorMode.Hidden && e.key === "/") {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null, 
                    message:""
                })
            } else if(e.key === "Escape") {
                updateMyPresence({message: ""})
                setCursorState({
                    mode:CursorMode.Hidden
                })
            }
        }

        const onKeyDown = (e:KeyboardEvent) => {
            
            if(e.key === "/") {
                e.preventDefault(); 
            }
        }

        window.addEventListener("keyup", onKeyUp); 
        window.addEventListener("keydown", onKeyDown); 

        return()=> {
            window.removeEventListener("keyup", onKeyUp); 
            window.removeEventListener("keydown", onKeyDown);
        }


    }, [updateMyPresence])


  return (
    <div
         onPointerMove = {handlePointerMove}
         onPointerLeave = {handlePointerLeave}
         onPointerDown = {handlePointerDown}
         className="h-[100vh] w-full flex justify-center items-center text-center"
    >
        <h1 className="text-2xl text-white">LiveBlocks Design It</h1>

        {cursor && 
            <CursorChat
                cursor = {cursor}
                cursorState = {cursorState}
                setCursorState = {setCursorState}
                updateMyPresence = {updateMyPresence}
            />
        }
      <LiveCursors others = {others}/>
    </div>
  )
}

export default Live
