
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface CreateCommentInput {
    comment: string;
    userId: number;
    postId: number;
}

export interface UpdateCommentInput {
    comment: string;
}

export interface PaginationInput {
    limit?: Nullable<number>;
    page?: Nullable<number>;
}

export interface CreatePostInput {
    title: string;
    content: string;
    authorId: number;
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

export interface Comment {
    id: string;
    comment: string;
    userId: number;
    postId: number;
    createdAt: string;
    updatedAt: string;
}

export interface IQuery {
    allComments(pagination?: Nullable<PaginationInput>): Nullable<Comment>[] | Promise<Nullable<Comment>[]>;
    comment(id: number): Nullable<Comment> | Promise<Nullable<Comment>>;
    commentsByPost(postId: number, pagination?: Nullable<PaginationInput>): Nullable<Comment>[] | Promise<Nullable<Comment>[]>;
    allPosts(pagination?: Nullable<PaginationInput>): Nullable<Post>[] | Promise<Nullable<Post>[]>;
    post(id: number): Nullable<Post> | Promise<Nullable<Post>>;
    allUsers(pagination?: Nullable<PaginationInput>): Nullable<User>[] | Promise<Nullable<User>[]>;
    user(id: number): Nullable<User> | Promise<Nullable<User>>;
    currentUser(): Nullable<User> | Promise<Nullable<User>>;
}

export interface IMutation {
    createComment(createCommentInput: CreateCommentInput): Comment | Promise<Comment>;
    updateComment(id: number, updateCommentInput: UpdateCommentInput): Comment | Promise<Comment>;
    removeComment(id: number): boolean | Promise<boolean>;
    createPost(createPostInput: CreatePostInput): Post | Promise<Post>;
    updatePost(id: number, updatePostInput: UpdatePostInput): Post | Promise<Post>;
    removePost(id: number): boolean | Promise<boolean>;
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    updateUser(id: number, updateUserInput: UpdateUserInput): User | Promise<User>;
    updateUserPassword(id: number, updateUserPasswordInput: UpdateUserPasswordInput): boolean | Promise<boolean>;
    removeUser(id: number): boolean | Promise<boolean>;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: number;
    comments?: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

type Nullable<T> = T | null;
