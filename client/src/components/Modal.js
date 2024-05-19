import { memo } from 'react';
import Button from './Button';
import { IoClose } from 'react-icons/io5';

const Modal = ({
  isModalOpen,
  setIsModalOpen,
  children,
  header,
  content,
  actions,
}) => {
  return isModalOpen ? (
    <div className="absolute top-0 left-0 w-full h-full bg-black/90 grid place-items-center">
      <div className="px-8 py-16 bg-blue w-96 h-64 shadow rounded relative">
        <Button
          className="absolute top-3 right-3"
          onClick={() => setIsModalOpen(false)}
          icon={<IoClose />}
          disabled={false}
          circle
        />
        {children}
      </div>
    </div>
  ) : null;
};

export default memo(Modal);
