import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faCircle, faCheckCircle, faPlus, faList, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Axios from "axios";

const ShoppingList = ({ listId, listName, listOwner, isLightMode, items, onAddItem, onQuantityPlus, onQuantityMinus, onToggleComplete }) => {
  const [isToggled, setIsToggled] = useState(true);
  const [localInputValue, setLocalInputValue] = useState('');
  const [inputValueList, setInputValueList] = useState('');
  const [localItems, setLocalItems] = useState(items);
  const totalItemCount = localItems.reduce((total, item) => (!item.isSelected ? total + item.quantity : total), 0);

  const handleChangeViewCompleted = () => {
    setIsToggled(!isToggled);
  };


  useEffect(() => {
    // Update localItems if items prop changes
    setLocalItems(items);
  }, [items]);

  const handleAddItem = () => {
    if (localInputValue.trim() !== '') {
      const item = {
        name: localInputValue,
        quantity: 1,
        isSelected: false,
      };

      Axios.post(`http://localhost:3001/addItemToList/${listId}`, item)
        .then((response) => {
          setLocalItems(response.data.items);
          setLocalInputValue(''); // Reset input value after successful addition
        })
        .catch((error) => {
          console.error('Error adding item:', error);
        });
    }
  };

  const handleQuantityPlus = (itemId) => {
    Axios.post(`http://localhost:3001/incrementItemQuantity/${listId}/${itemId}`)
      .then((response) => {
        // Assuming response.data is the updated item
        setLocalItems(currentItems => currentItems.map(item => {
          return item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item;
        }));
      })
      .catch((error) => {
        console.error('Error incrementing quantity:', error);
      });
};

const handleQuantityMinus = (itemId) => {
  const currentItem = localItems.find(item => item._id === itemId);

  if (currentItem && currentItem.quantity > 1) {
    Axios.post(`http://localhost:3001/decrementItemQuantity/${listId}/${itemId}`)
      .then((response) => {
        setLocalItems(currentItems => currentItems.map(item => {
          return item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item;
        }));
      })
      .catch((error) => {
        console.error('Error decrementing quantity:', error);
      });
  } else if (currentItem && currentItem.quantity === 1) {
    // If quantity is 1, a decrement would set it to 0, so delete the item
    Axios.delete(`http://localhost:3001/deleteItem/${listId}/${itemId}`)
      .then(() => {
        // Filter out the item from localItems
        setLocalItems(currentItems => currentItems.filter(item => item._id !== itemId));
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
      });
  }
};


const toggleItemSelection = (itemId) => {
  Axios.patch(`http://localhost:3001/toggleItemSelection/${listId}/${itemId}`)
      .then((response) => {
          // Update the localItems state to reflect the change
          setLocalItems(currentItems => currentItems.map(item => {
              if (item._id === itemId) {
                  // Directly use the response data if the structure matches
                  return response.data;
              }
              return item;
          }));
      })
      .catch((error) => {
          console.error('Error toggling item selection:', error);
      });
};

  const getFilteredItems = () => {
    return isToggled ? localItems : localItems.filter((item) => !item.isSelected);
  };


  return (
    <div className='main-container'>
      <div>
        <div className='owner-and-name'>
          <span>{listName}</span>
          <span className='owner'>
            <FontAwesomeIcon icon={faUser} />
            {listOwner}
          </span>
        </div>
      </div>
      <div className='add-item-box'>
        <input
          value={localInputValue}
          onChange={(event) => setLocalInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAddItem();
            }
          }}
          className={`change-list-name ${isLightMode ? '' : 'dark-mode'}`}
          style={{ color: isLightMode ? 'var(--text-light)' : 'var(--text-dark)' }}
          placeholder='Přidat položku...'
        />
        <FontAwesomeIcon icon={faPlus} onClick={handleAddItem} />
      </div>
      <div className='item-list'>
        {getFilteredItems().map((item, index) => (
          <div className='item-container' key={item._id || index}>
            <div className='item-name' onClick={() => toggleItemSelection(item._id)}>
              {item.isSelected ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className='completed'>{item.name}</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCircle} />
                  <span>{item.name}</span>
                </>
              )}
            </div>
            <div className='quantity'>
              <button>
                <FontAwesomeIcon icon={faChevronLeft} onClick={() => handleQuantityMinus(item._id)} />
              </button>
              <span>{item.quantity}</span>
              <button>
                <FontAwesomeIcon icon={faChevronRight} onClick={() => handleQuantityPlus(item._id)} />
              </button>
            </div>
          </div>
        ))}
        <FormGroup>
          <FormControlLabel control={<Switch defaultChecked={isToggled} onChange={handleChangeViewCompleted} />} label='Zobrazit splněné' />
        </FormGroup>
        <div className='total'>Total: {totalItemCount}</div>
      </div>
    </div>
  );
};

export default ShoppingList;
