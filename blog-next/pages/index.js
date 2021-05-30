import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {Button, Dialog, DialogTitle, GridListTile, ListSubheader, Modal, TextField} from "@material-ui/core";
import { positions } from '@material-ui/system';
import { GridList } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CommentIcon from '@material-ui/icons/Comment';
import {useUser} from "@auth0/nextjs-auth0";
import {useState} from "react";
import {InputModalContext} from "../../blog-strapi/.cache/plugins/strapi-plugin-upload/admin/src/contexts";
import * as classes from "postcss";



export default function Home({ posts }) {
  const ApiUrl = 'http://localhost:1337';
    const {user, error, isLoading} = useUser();
    const [modal, setModal] = useState(false);
    const [CreatePost, CreateComment] = useState('');
    const AddLikes = (post) => {
        post.Likes ++;
    }

    async function AddComments (post,content) {

        const res = await fetch(
            ApiUrl+'/comments',
            {
                body: JSON.stringify({
                    content: content,
                    MadeBy: user.name,
                    MadeIn: post.Title,

                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        )

        const result = await res.json()
    }


  return (
   <div>

     <div>
         {isLoading && <div>Loading...</div>}
         {error && <div>{error.message}</div>}
         {user && <div>Welcome {user.name}!
            <a href="/api/auth/logout">Logout</a>
         </div>}
         {!user && <a href="/api/auth/login">Login</a>}
     </div>
       <div>
           <h1>Vlog Home</h1>
           <div>
               <Button onClick={() => setModal(true)}>Create Post</Button>
               <Dialog open={modal} onClose={() => setModal(false)} id="post">
                    <DialogTitle>Create your own post!</DialogTitle>

                    <Button onClick={()=>setModal(false)}>close</Button>
               </Dialog>
           </div>

       </div>
       <GridList cellHeight={1000}>
           {posts &&
           posts.map((post) => (
               <div key={post.id} >
                   <h2>{post.Title}</h2>
                   <h3>{post.Slug}</h3>
                   <h3>{post.PostedBy.username}</h3>
                   {post.Content[0].ext==".jpg" && <Image src={ApiUrl + post.Content[0].url} width={500} height={500}/>}
                   {post.Content[0].ext==".mp4" && <video src={ApiUrl + post.Content[0].url} width={500} height={500} controls autoPlay/>}
                   <Button onClick={AddLikes(post)}>Likes {post.Likes}</Button>
                   <div>
                       <Button onClick={() => setModal(true)}>Add Comment</Button>
                       <Dialog open={modal} onClose={() => setModal(false)} id="comment">
                           <DialogTitle>Your comment here: </DialogTitle>
                           <form className="comment-form" noValidate autoComplete="off">
                               <TextField id="comment-content" label="Comment" onChange={event => AddComments(post,event.target.value)}/>
                               <Button type="submit" onClick={AddComments}>Submit</Button>
                               <Button onClick={()=>setModal(false)}>close</Button>
                           </form>
                       </Dialog>
                   </div>
                   {
                       post.comments.length!=0 && post.comments.map((comment) => (
                           <div key={comment.id}>
                               <h5>user{comment.MadeBy}: {comment.content}</h5>
                           </div>
                       ))
                   }
               </div>
           ))

           }
       </GridList>

   </div>
  )
}

export async function getStaticProps() {
  //get posts from api
    const backApi = 'http://localhost:1337';
  const res = await fetch(backApi+'/posts');
  const posts = await res.json();


  return {
    props: { posts },
  }
}

