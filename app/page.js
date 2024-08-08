'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {Camera} from "react-camera-pro";
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import styles from "./page.css";
// import { Modal } from '@mui/base/Modal';
import { Modal } from '@mui/base/Modal';

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
  const [inventory, setInventory] = useState([])

  const camera = useRef (null);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [newEditedItem, setNewEditedItem] = useState(null);
  const [newQuantity, setQuantity] = useState(0);

  const [open, setOpen] = useState(false);

  const [newName, setNewName] = useState('');

  const [edited, setEdited]= useState(false);

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

    // otherwise if it already exists in the collection then decrement the count by one 
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
      setItem('');
  }

  const handleEdit = async() => {
    if(newEditedItem){
      const oldRef = doc(collection(firestore, "inventory"), newEditedItem)
      const newRef = doc(collection(firestore, "inventory"), newName);

      if(newEditedItem.name !== newName){
        await deleteDoc(oldRef)
      }

        await setDoc(newRef, {
          quantity: newQuantity,
        })
    
    await resetInventory();
    handleClose();
    }
  }

  function openModal(item){
    setOpen(true);
    setNewEditedItem(item);
    setNewName(item.name);
    setQuantity(item.quantity);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <Box>
      <Typography className="title"variant="h1">Pantry Pro</Typography>
      
      <TextField className="search-bar-container"
        id="outlined-controlled"
        label="Search"
        value={item}
        onChange ={(e) => setItem(e.target.value)
      }
      />

      <Button className="add-item-container" variant = "contained" onClick={()=>handleAddItem()}>
        Add Item
      </Button>

      <Button className="delete-item-container" variant="contained" onClick={()=>handleDeleteItem(item)}>
        Delete Item
      </Button>

      <Box className="items-container">
        {inventory.map(item=>(
            (<Box className="item-container" key={item.name}>
              <Typography variant = "h6">{item.name}</Typography>
              <Typography>Quanity: {item.quantity}</Typography>
              <Button className="update-item-container" variant = "contained" onClick={()=>openModal(item)}>
              Edit Item
            </Button>             
          </Box>  )  
        ))}
      </Box>

      <Modal open={open} onClose={handleClose}>
            <Box>
            <Typography variant="h6">Edit Item</Typography>
            <TextField className="modal-container"
              label="Item Name"
              value={newName} 
              onChange={(e)=>setNewName(e.target.value)}
            />

            <TextField className="modal-container"
              label="Enter new quantity"
              type="number"
              value={newQuantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              />

            <Button onClick={handleEdit}>
              Submit New Edit
            </Button>

            <Button onClick={handleClose}>
              Close Modal
            </Button>
            </Box>
        </Modal>

      {isCameraOpen && 
        (<Camera ref={camera}/>)}
          {image && <img src={image} alt="image preview"/>}
        <Button
            variant = "contained"
            onClick={()=>{
              if(isCameraOpen){
                const photo=camera.current.takePhoto();
                setImage(photo);
                setImages((prevImages)=>photo, ...images); 
              }
            }}>
          {isCameraOpen ? "Take Photo": "Close Camera"}
        </Button>

        <Button
          variant = "contained"
          onClick={() => setIsCameraOpen(!isCameraOpen)}>
            {isCameraOpen ? "Close Camera": "Take Photo"}
        </Button>
    </Box>
  )
}

