//#region ===== IMPORTS =====
import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router'

import Button from './Button';
import Input from './Input';

import { useSafeMessage } from '../hooks/useSafeMessage';

import api from '../services/api';
import debug from '../utils/debug';

import styles from './styles/SearchBar.module.scss'
//#endregion

export const SearchBar = () => {
  //#region ===== CONSTS =====
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const safeMessage = useSafeMessage()
  //#endregion
  //#region ===== HANDLERS =====
  const handleChange = (e) => {
    const inputValue = e.target.value
    if (/^\d*$/.test(inputValue)) {
      setSearchValue(e.target.value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // if nothing in input field
    if (!searchValue.trim()) {
      safeMessage("warning", "Введите № карты")
      return
    }
    setIsLoading(true)
    const res = await api.getPatient(searchValue.trim())
    if (!res.ok) {
      safeMessage("error", res.message || "Пациент не найден")
      setIsLoading(false)
      return
    }

    // navigate if searched patient exists
    navigate(`/search/${searchValue}`, {
      state: {
        results: [res.data],
        searchQuery: searchValue
      }
    })

    setIsLoading(false)
  }
  //#endregion

  return (
    <div className={styles.container}>
      <form>
        <div className={styles.searchtitle}>
          Поиск пациентов:
        </div>
        <search>
          <Input
            id='searchfield'
            type='search'
            value={searchValue}
            onChange={handleChange}
            placeholder='№ карты'
            autoComplete='off'
            inputMode='numeric'
            pattern='[0-9]*'
            className={styles.searchfield}
            onSubmitClick={handleSubmit}
            loading={isLoading}
          />
        </search>
      </form>
    </div>
  )
}