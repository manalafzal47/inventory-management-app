'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {

  const [item, setItem]= useState('');
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState([])

  const resetInventory = async () =>{
    // need to add new item to inventory 
    try {
      const q = query(collection(firestore, "inventory"));
      const docs = await getDocs(q);
      const newItem = []
      docs.forEach((doc)=>{
        newItem.push ({
          name: doc.id, 
          ...doc.data(),
      });
      });
      setInventory(newItem);
    }
    catch(e){
      console.error(e);
    }
  };
  
  useEffect(()=>{
    resetInventory();
  }, [])

  const handleDeleteItem = async(item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
      const {quantity} = docSnap.data();

    // check if the item exists in the collection, if it does remove it from the collection
      if (quantity === 1){
        await deleteDoc(docRef)
      }

    // otheriwse if it already exists in the collection then decrement the count by one 
      else{
        await setDoc(docRef, {
          quantity: quantity - 1,
        });
      }

      await resetInventory();
    }
  }

  const handleAddItem = async() => {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);  

      if(docSnap.exists()){
        const {quantity} = docSnap.data();
          await setDoc(docRef, {
            quantity: quantity+1,
        })}
        
      else {
        await setDoc(docRef, {quantity: 1})
      }
      await resetInventory();
  }

  return (
    <Box>
      <Typography variant="h1">Inventory Management</Typography>
      <TextField
        label="Item Name"
        value={item}
        onChange ={(e) => setItem(e.target.value)
        }
      />
      <Button variant = "contained" onClick={()=>handleAddItem()}>
        Add Item
      </Button>

      <Button variant="contained" onClick={()=>handleDeleteItem(item)}>
        Delete Item
      </Button>

      <Button variant = "contained" onClick={() => resetInventory()}>
        Update Item
      </Button>

      {inventory.map(item=>(
        <Box key={item.name}>
          <Typography variant = "h6">{item.name}</Typography>
          <Typography>Quanity: {item.quantity}</Typography>    
        </Box>    
      ))}
    </Box>
  )
}
