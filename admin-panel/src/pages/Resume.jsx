import { useState } from 'react'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
export default function Resume(){
  const [file,setFile]=useState(null),[url,setUrl]=useState('')
  const upload=async(e)=>{e.preventDefault();if(!file)return;const r=ref(storage,'resume/resume.pdf');await uploadBytes(r,file);setUrl(await getDownloadURL(r));alert('Uploaded')}
  return (
    <form onSubmit={upload} className="bg-gray-800 p-4 rounded space-y-2 max-w-xl">
      <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])}/>
      <button className="bg-blue-600 px-4 py-2 rounded">Upload Resume</button>
      {url && <p className="text-sm text-green-400 break-all">{url}</p>}
    </form>
  )
}
