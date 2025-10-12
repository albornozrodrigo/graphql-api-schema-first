
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface AuthInput {
    email: string;
    password: string;
}

export interface CommentInput {
    comment: string;
    postId: string;
}

export interface PaginationInput {
    limit?: Nullable<number>;
    page?: Nullable<number>;
}

export interface CreatePostInput {
    title: string;
    content: string;
}

export interface UpdatePostInput {
    title: string;
    content: string;
}

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserInput {
    name: string;
    email: string;
}

export interface UpdateUserPasswordInput {
    password: string;
}

export interface AuthResponse {
    access_token: string;
}

export interface IMutation {
    login(authInput: AuthInput): AuthResponse | Promise<AuthResponse>;
    createComment(createCommentInput: CommentInput): Comment | Promise<Comment>;
    updateComment(id: string, updateCommentInput: CommentInput): Comment | Promise<Comment>;
    removeComment(id: string): boolean | Promise<boolean>;
    createPost(createPostInput: CreatePostInput): Post | Promise<Post>;
    updatePost(id: string, updatePostInput: UpdatePostInput): Post | Promise<Post>;
    removePost(id: string): boolean | Promise<boolean>;
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;
    updateUserPassword(updateUserPasswordInput: UpdateUserPasswordInput): boolean | Promise<boolean>;
    removeUser(): boolean | Promise<boolean>;
}

export interface Comment {
    id: string;
    comment: string;
    user: User;
    post: Post;
    createdAt: string;
    updatedAt: string;
}

export interface IQuery {
    allComments(pagination?: Nullable<PaginationInput>): Nullable<Comment>[] | Promise<Nullable<Comment>[]>;
    comment(id: string): Nullable<Comment> | Promise<Nullable<Comment>>;
    commentsByPostId(postId: string, pagination?: Nullable<PaginationInput>): Nullable<Comment>[] | Promise<Nullable<Comment>[]>;
    allPosts(pagination?: Nullable<PaginationInput>): Nullable<Post>[] | Promise<Nullable<Post>[]>;
    allPostsByAuthor(pagination?: Nullable<PaginationInput>): Nullable<Post>[] | Promise<Nullable<Post>[]>;
    post(id: number): Nullable<Post> | Promise<Nullable<Post>>;
    allUsers(pagination?: Nullable<PaginationInput>): Nullable<User>[] | Promise<Nullable<User>[]>;
    user(id: number): Nullable<User> | Promise<Nullable<User>>;
    me(): User | Promise<User>;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    author: User;
    comments?: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    posts?: Post[];
    createdAt: string;
    updatedAt: string;
}

type Nullable<T> = T | null;
