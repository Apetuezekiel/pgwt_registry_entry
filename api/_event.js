// Mirror of src/components/register/eventInfo.js for the emails. Keep the two in step when the flier changes.
// (The function cannot import from src: CRA's source is ESM and this folder is bundled separately.)
module.exports = {
  name: 'Praise God with the Twins',
  year: 2026,
  theme: 'Jubilee',
  conveners: 'Taiwo and Kenny Jones',
  enquiries: { display: '+234 704 721 2000', tel: '+2347047212000' },
  sessions: [
    { day: 'Wed 21 – Thu 22 Oct', time: '5PM', title: 'Two evenings of praise' },
    {
      day: 'Fri 23 Oct',
      time: '10PM',
      venue: 'Goodwill Baptist Church',
      address: '10 Fadare Street, opposite Kayode Street, by Caterpillar bus stop, Ogba',
    },
    {
      day: 'Sun 25 Oct',
      time: '12 Noon',
      title: 'Thanksgiving',
      venue: 'Bevent Event Center',
      address: 'Lagos Airport Hotel, Ikeja, Lagos',
    },
  ],
};
