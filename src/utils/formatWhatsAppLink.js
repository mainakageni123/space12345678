const formatWhatsAppLink = (phoneNumber, type = 'message') => {
  const formattedNumber = phoneNumber.replace(/\+/g, '');
  return type === 'call' 
    ? `whatsapp://call?phone=${formattedNumber}`
    : `https://wa.me/${formattedNumber}`;
};

export default formatWhatsAppLink;