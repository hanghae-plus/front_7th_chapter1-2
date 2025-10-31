// Detail Fields Component to input description, location, and category
// 상세 필드 컴포넌트 (설명, 위치, 카테고리 입력)

import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { CATEGORIES } from '@/constants/categories';
import { DetailFieldsProps } from '@/types/events/DetailFieldsProps.types';
import { DetailFieldsPropsHandlers } from '@/types/events/EventFormHandlers.types';

export const DetailFields = ({
  description,
  setDescription,
  location,
  setLocation,
  category,
  setCategory,
}: DetailFieldsProps & DetailFieldsPropsHandlers) => {
  return (
    <>
      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {CATEGORIES.map((cat) => (
            <MenuItem
              key={cat}
              value={cat}
              aria-label={`${cat}-option`}
            >
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
